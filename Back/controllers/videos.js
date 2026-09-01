const crypto = require('node:crypto');
const Video = require('../models/Video');
const fetch = require('node-fetch').default;
const Profile = require('../models/Profile');
const Follow = require('../models/Follow');
const View = require('../models/View');
const {
    LAMBDA, LIKE_WEIGHT, COMMENT_WEIGHT, VIEW_WEIGHT, BASE_FLOOR, FOLLOW_BOOST, VIEWED_PENALTY,
    MAX_FOLLOWED, MAX_VIEWED, ANON_JITTER,
    encodeCursor, decodeCursor,
} = require('../utils/feedRanking');
const { publicVideoProjection, toPublicVideo } = require('../utils/publicVideo');

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

const createVideo = async (req, res) => {
    const { upload_id, title, description } = req.body;

    if (!upload_id) return res.status(400).json({ message: 'Upload id is required.' });
    if (!title) return res.status(400).json({ message: 'Title is required.' });
    if (!description) return res.status(400).json({ message: 'Description is required.' });

    if (typeof upload_id !== 'string') return res.status(400).json({ message: 'Upload id must be a string.' });
    if (typeof title !== 'string') return res.status(400).json({ message: 'Title must be a string.' });
    if (typeof description !== 'string') return res.status(400).json({ message: 'Description must be a string.' });

    const id = crypto.randomUUID();

    const video = new Video({ id, userId: req.user.id, upload_id, uploadId: upload_id, title: title.trim(), description: description.trim() });
    await video.save();

    const json = video.toJSON();
    delete json._id;
    delete json.__v;

    return res.status(201).json(json);
};

const listVideos = async (req, res) => {
    try {
        const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 6));
        const cursor = req.query.cursor ? decodeCursor(req.query.cursor) : null;

        const nowMs = cursor ? cursor.ts : Date.now();

        let followedIds = [];
        let viewedIds = [];
        if (req.user) {
            const [follows, views] = await Promise.all([
                Follow.find({ followerId: req.user.id }).select('userId').limit(MAX_FOLLOWED),
                View.find({ userId: req.user.id }).select('videoId').limit(MAX_VIEWED),
            ]);
            followedIds = follows.map(f => f.userId).filter(Boolean);
            viewedIds = views.map(v => v.videoId).filter(Boolean);
        }

        const anon = !req.user;
        const seed = anon ? (cursor && typeof cursor.seed === 'number' ? cursor.seed : Math.floor(Math.random() * 1e9) + 1) : 0;

        // score = (BASE_FLOOR + LIKE_WEIGHT*ln(1+likes) + COMMENT_WEIGHT*ln(1+comments))
        //         * exp(-LAMBDA * ageHours) * (isFollowed ? FOLLOW_BOOST : 1)
        const scoreExpr = {
            $let: {
                vars: {
                    recency: {
                        $exp: {
                            $multiply: [
                                -LAMBDA,
                                { $divide: [{ $subtract: [nowMs, { $toLong: '$createdAt' }] }, 3600000] },
                            ],
                        },
                    },
                    engagement: {
                        $add: [
                            BASE_FLOOR,
                            { $multiply: [LIKE_WEIGHT, { $ln: { $add: [1, { $ifNull: ['$likes', 0] }] } }] },
                            { $multiply: [COMMENT_WEIGHT, { $ln: { $add: [1, { $ifNull: ['$commentCount', 0] }] } }] },
                            { $multiply: [VIEW_WEIGHT, { $ln: { $add: [1, { $ifNull: ['$viewCount', 0] }] } }] },
                        ],
                    },
                    boost: { $cond: [{ $in: ['$userId', followedIds] }, FOLLOW_BOOST, 1] },
                    seenPenalty: { $cond: [{ $in: ['$id', viewedIds] }, VIEWED_PENALTY, 1] },
                    jitter: seed === 0 ? 1 : {
                        $let: {
                            vars: {
                                h: { $mod: [{ $multiply: [{ $toLong: '$createdAt' }, seed] }, 1000] },
                            },
                            // map 0..999 -> [1 - ANON_JITTER/2, 1 + ANON_JITTER/2]
                            in: { $add: [{ $subtract: [1, { $divide: [ANON_JITTER, 2] }] }, { $multiply: [{ $divide: ['$$h', 999] }, ANON_JITTER] }] },
                        },
                    },
                },
                in: {
                    $round: [
                        { $multiply: [{ $multiply: [{ $multiply: [{ $multiply: ['$$engagement', '$$recency'] }, '$$boost'] }, '$$seenPenalty'] }, '$$jitter'] },
                        6,
                    ],
                },
            },
        };

        const pipeline = [
            { $match: { playback_id: { $exists: true, $ne: null }, status: 'ready' } },
            { $addFields: { score: scoreExpr } },
        ];

        if (cursor) {
            pipeline.push({
                $match: {
                    $or: [
                        { score: { $lt: cursor.score } },
                        { score: cursor.score, id: { $gt: cursor.id } },
                    ],
                },
            });
        }

        pipeline.push(
            { $sort: { score: -1, id: 1 } },
            { $limit: limit + 1 },
            { $project: publicVideoProjection(['commentCount', 'score']) },
        );

        const rows = await Video.aggregate(pipeline);

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;

        const userIds = [...new Set(items.map(v => v.userId).filter(Boolean))];
        const profiles = userIds.length ? await Profile.find({ id: { $in: userIds } }) : [];
        const usernameById = new Map(profiles.map(p => [p.id, p.username]));
        items.forEach(v => { v.username = usernameById.get(v.userId); });

        let nextCursor = null;
        if (hasMore) {
            const last = items[items.length - 1];
            const payload = { ts: nowMs, score: last.score, id: last.id };
            if (anon) payload.seed = seed;
            nextCursor = encodeCursor(payload);
        }

        return res.status(200).json({ items, nextCursor });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const resolveVideo = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findOne({ id });
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    if (video.playback_id) {
        return res.status(200).json(toPublicVideo(video));
    }

    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

    try {
        if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) return res.status(500).json({ message: 'MUX credentials missing.' });

        if (!video.asset_id && video.upload_id) {
            const up = await fetch(`https://api.mux.com/video/v1/uploads/${video.upload_id}`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            });
            const upJson = await up.json();
            const assetId = upJson?.data?.asset_id;
            if (assetId) {
                video.asset_id = assetId;
            }
        }

        if (video.asset_id) {
            const asset = await fetch(`https://api.mux.com/video/v1/assets/${video.asset_id}`, {
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
                }
            });
            const assetJson = await asset.json();
            const playbackId = Array.isArray(assetJson?.data?.playback_ids) && assetJson.data.playback_ids.length > 0 ? assetJson.data.playback_ids[0].id : undefined;
            if (playbackId) {
                video.playback_id = playbackId;
                video.status = 'ready';
            }
        }

        await video.save();
        return res.status(200).json(toPublicVideo(video));
    } catch (err) {
        return res.status(500).json({ message: 'Resolve error.' });
    }
};

const listMyVideos = async (req, res) => {
    const videos = await Video.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100);
    const profile = await Profile.findOne({ id: req.user.id });
    const username = profile?.username;

    const authHeader = (MUX_TOKEN_ID && MUX_TOKEN_SECRET) ? { 'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}` } : null;

    const enriched = await Promise.all(videos.map(async v => {
        const json = v.toJSON();
        delete json._id; delete json.__v;
        json.username = username;
        json.views = 0;
        try {
            if (authHeader) {
                const dim = v.asset_id ? `asset_id:${v.asset_id}` : (v.playback_id ? `playback_id:${v.playback_id}` : null);
                if (dim) {
                    let count = 0;
                    const r1 = await fetch(`https://api.mux.com/data/v1/video-views?filters[]=${encodeURIComponent(dim)}&timeframe[]=7:days&limit=1`, { headers: authHeader });
                    const j1 = await r1.json();
                    if (typeof j1?.total_row_count === 'number') count = j1.total_row_count;
                    if (!count) {
                        const r2 = await fetch(`https://api.mux.com/data/v1/metrics/views?filters[]=${encodeURIComponent(dim)}&timeframe[]=7:days`, { headers: authHeader });
                        const j2 = await r2.json();
                        if (j2 && Array.isArray(j2.data)) {
                            const totals = j2.data.find(x => x.name === 'totals');
                            const maybe = totals?.view_count;
                            if (typeof maybe === 'number') count = maybe;
                        }
                    }
                    if (count) json.views = count;
                }
            }
        } catch {}
        return json;
    }));

    return res.status(200).json(enriched);
};

const listUserVideos = async (req, res) => {
    const userId = String(req.params.id || '').trim();
    if (!userId) return res.status(400).json({ message: 'User id is required.' });
    const videos = await Video.find({ userId }).sort({ createdAt: -1 }).limit(100);
    const profile = await Profile.findOne({ id: userId });
    const username = profile?.username;

    const authHeader = (MUX_TOKEN_ID && MUX_TOKEN_SECRET) ? { 'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}` } : null;

    const enriched = await Promise.all(videos.map(async v => {
        const json = toPublicVideo(v);
        json.username = username;
        json.views = 0;
        try {
            if (authHeader) {
                const dim = v.asset_id ? `asset_id:${v.asset_id}` : (v.playback_id ? `playback_id:${v.playback_id}` : null);
                if (dim) {
                    let count = 0;
                    const r1 = await fetch(`https://api.mux.com/data/v1/video-views?filters[]=${encodeURIComponent(dim)}&timeframe[]=7:days&limit=1`, { headers: authHeader });
                    const j1 = await r1.json();
                    if (typeof j1?.total_row_count === 'number') count = j1.total_row_count;
                    if (!count) {
                        const r2 = await fetch(`https://api.mux.com/data/v1/metrics/views?filters[]=${encodeURIComponent(dim)}&timeframe[]=7:days`, { headers: authHeader });
                        const j2 = await r2.json();
                        if (j2 && Array.isArray(j2.data)) {
                            const totals = j2.data.find(x => x.name === 'totals');
                            const maybe = totals?.view_count;
                            if (typeof maybe === 'number') count = maybe;
                        }
                    }
                    if (count) json.views = count;
                }
            }
        } catch {}
        return json;
    }));

    return res.status(200).json(enriched);
};

const removeVideo = async (video) => {
    try {
        if (MUX_TOKEN_ID && MUX_TOKEN_SECRET) {
            const auth = { 'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}` };
            if (video.asset_id) {
                await fetch(`https://api.mux.com/video/v1/assets/${video.asset_id}`, { method: 'DELETE', headers: auth });
            } else if (video.upload_id) {
                await fetch(`https://api.mux.com/video/v1/uploads/${video.upload_id}`, { method: 'DELETE', headers: auth });
            }
        }
    } catch {}
    await Video.deleteOne({ id: video.id });
};

const deleteVideo = async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        if (!id) return res.status(400).json({ message: 'Video id is required.' });

        const video = await Video.findOne({ id });
        if (!video) return res.status(404).json({ message: 'Video not found.' });
        if (video.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden.' });

        await removeVideo(video);
        return res.status(200).json({ message: 'Video deleted.' });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const computeMuxViewsForVideo = async (v) => {
    try {
        const authHeader = (MUX_TOKEN_ID && MUX_TOKEN_SECRET) ? { 'Authorization': `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}` } : null;
        if (!authHeader) return 0;
        const dim = v.asset_id ? `asset_id:${v.asset_id}` : (v.playback_id ? `playback_id:${v.playback_id}` : null);
        if (!dim) return 0;
        let count = 0;
        const r1 = await fetch(`https://api.mux.com/data/v1/video-views?filters[]=${encodeURIComponent(dim)}&timeframe[]=7:days&limit=1`, { headers: authHeader });
        const j1 = await r1.json();
        if (typeof j1?.total_row_count === 'number') count = j1.total_row_count;
        if (!count) {
            const r2 = await fetch(`https://api.mux.com/data/v1/metrics/views?filters[]=${encodeURIComponent(dim)}&timeframe[]=7:days`, { headers: authHeader });
            const j2 = await r2.json();
            if (j2 && Array.isArray(j2.data)) {
                const totals = j2.data.find(x => x.name === 'totals');
                const maybe = totals?.view_count;
                if (typeof maybe === 'number') count = maybe;
            }
        }
        return count || 0;
    } catch {
        return 0;
    }
}

module.exports = {
    createVideo,
    listVideos,
    resolveVideo,
    listMyVideos,
    listUserVideos,
    deleteVideo,
    removeVideo,
    computeMuxViewsForVideo
};
