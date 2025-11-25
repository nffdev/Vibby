const crypto = require('node:crypto');
const Video = require('../models/Video');
const fetch = require('node-fetch').default;
const Profile = require('../models/Profile');

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
    const videos = await Video.find({}).sort({ createdAt: -1 }).limit(50);

    const userIds = [...new Set(videos.map(v => v.userId).filter(Boolean))];
    const profiles = userIds.length ? await Profile.find({ id: { $in: userIds } }) : [];
    const usernameById = new Map(profiles.map(p => [p.id, p.username]));

    const final = videos.map(v => {
        const json = v.toJSON();
        delete json._id; delete json.__v;
        json.username = usernameById.get(json.userId);
        return json;
    });

    return res.status(200).json(final);
};

const resolveVideo = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findOne({ id });
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    if (video.playback_id) {
        const json = video.toJSON();
        delete json._id; delete json.__v;
        return res.status(200).json(json);
    }

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
        const final = video.toJSON(); delete final._id; delete final.__v;
        return res.status(200).json(final);
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

const deleteVideo = async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        if (!id) return res.status(400).json({ message: 'Video id is required.' });

        const video = await Video.findOne({ id });
        if (!video) return res.status(404).json({ message: 'Video not found.' });
        if (video.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden.' });

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

        await Video.deleteOne({ id });
        return res.status(200).json({ message: 'Video deleted.' });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    createVideo,
    listVideos,
    resolveVideo,
    listMyVideos,
    listUserVideos,
    deleteVideo
};
