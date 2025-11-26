const Dislike = require('../models/Dislike');
const Video = require('../models/Video');

const toggle = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });

        const video = await Video.findOne({ id: videoId });
        if (!video) return res.status(404).json({ message: 'Video not found.' });

        const existing = await Dislike.findOne({ userId: req.user.id, videoId });
        if (existing) {
            await Dislike.deleteOne({ _id: existing._id });
            video.dislikes = Math.max(0, (typeof video.dislikes === 'number' ? video.dislikes : 0) - 1);
            await video.save();
            return res.status(200).json({ disliked: false, dislikes: video.dislikes });
        }
        await new Dislike({ userId: req.user.id, videoId }).save();
        const Like = require('../models/Like');
        const existingLike = await Like.findOne({ userId: req.user.id, videoId });
        if (existingLike) {
            await Like.deleteOne({ _id: existingLike._id });
            video.likes = Math.max(0, (typeof video.likes === 'number' ? video.likes : 0) - 1);
        }
        video.dislikes = (typeof video.dislikes === 'number' ? video.dislikes : 0) + 1;
        await video.save();
        return res.status(200).json({ disliked: true, dislikes: video.dislikes });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { toggle };

const listMe = async (req, res) => {
    try {
        const dislikes = await Dislike.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100);
        const liked = await require('../models/Like').find({ userId: req.user.id });
        const likedIds = new Set(liked.map(l => l.videoId));
        const videoIds = dislikes.map(l => l.videoId).filter(id => !likedIds.has(id));
        const videos = videoIds.length ? await Video.find({ id: { $in: videoIds } }) : [];
        const byId = new Map(videos.map(v => [v.id, v]));

        const final = videoIds
            .map(id => byId.get(id))
            .filter(Boolean)
            .map(v => {
                const json = v.toJSON();
                delete json._id; delete json.__v;
                return json;
            });

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { toggle, listMe };
