const Like = require('../models/Like');
const Video = require('../models/Video');
const { computeMuxViewsForVideo } = require('./videos');

const toggle = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });

        const video = await Video.findOne({ id: videoId });
        if (!video) return res.status(404).json({ message: 'Video not found.' });

        const existing = await Like.findOne({ userId: req.user.id, videoId });
        if (existing) {
            await Like.deleteOne({ _id: existing._id });
            video.likes = Math.max(0, (typeof video.likes === 'number' ? video.likes : 0) - 1);
            await video.save();
            return res.status(200).json({ liked: false, likes: video.likes });
        }
        await new Like({ userId: req.user.id, videoId }).save();
        video.likes = (typeof video.likes === 'number' ? video.likes : 0) + 1;
        await video.save();
        return res.status(200).json({ liked: true, likes: video.likes });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

const listMe = async (req, res) => {
    try {
        const likes = await Like.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100);
        const videoIds = likes.map(l => l.videoId);
        const videos = videoIds.length ? await Video.find({ id: { $in: videoIds } }) : [];
        const byId = new Map(videos.map(v => [v.id, v]));

        const final = await Promise.all(videoIds
            .map(id => byId.get(id))
            .filter(Boolean)
            .map(async v => {
                const json = v.toJSON();
                delete json._id; delete json.__v;
                json.views = await computeMuxViewsForVideo(v);
                return json;
            }));

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

const listUser = async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        if (!id) return res.status(400).json({ message: 'User id is required.' });
        const likes = await Like.find({ userId: id }).sort({ createdAt: -1 }).limit(100);
        const videoIds = likes.map(l => l.videoId);
        const videos = videoIds.length ? await Video.find({ id: { $in: videoIds } }) : [];
        const byId = new Map(videos.map(v => [v.id, v]));

        const final = await Promise.all(videoIds
            .map(id => byId.get(id))
            .filter(Boolean)
            .map(async v => {
                const json = v.toJSON();
                delete json._id; delete json.__v;
                json.views = await computeMuxViewsForVideo(v);
                return json;
            }));

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

module.exports = {
    toggle,
    listMe,
    listUser
}
