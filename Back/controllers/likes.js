const Like = require('../models/Like');
const Video = require('../models/Video');
const Notification = require('../models/Notification');
const { computeMuxViewsForVideo } = require('./videos');
const { createNotification } = require('./notifications');

const toggle = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });

        const video = await Video.findOne({ id: videoId });
        if (!video) return res.status(404).json({ message: 'Video not found.' });

        const existing = await Like.findOne({ userId: req.user.id, videoId });
        if (existing) {
            await Like.deleteOne({ _id: existing._id });
            const updated = await Video.findOneAndUpdate(
                { id: videoId, likes: { $gt: 0 } },
                { $inc: { likes: -1 } },
                { new: true }
            );
            const likes = updated ? updated.likes : (video.likes || 0);
            await Notification.deleteOne({ userId: video.userId, actorId: req.user.id, type: 'like', videoId });
            return res.status(200).json({ liked: false, likes });
        }

        try {
            await new Like({ userId: req.user.id, videoId }).save();
        } catch (e) {
            if (e && e.code === 11000) {
                return res.status(200).json({ liked: true, likes: video.likes || 0 });
            }
            throw e;
        }
        const updated = await Video.findOneAndUpdate(
            { id: videoId },
            { $inc: { likes: 1 } },
            { new: true }
        );
        await createNotification({ userId: video.userId, actorId: req.user.id, type: 'like', videoId });
        return res.status(200).json({ liked: true, likes: updated ? updated.likes : (video.likes || 0) + 1 });
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
