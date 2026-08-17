const crypto = require('node:crypto');
const Report = require('../models/Report');
const Video = require('../models/Video');

const REASONS = ['spam', 'inappropriate', 'harassment', 'violence', 'other'];

const create = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        const { reason, detail } = req.body || {};

        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });
        if (!REASONS.includes(reason)) return res.status(400).json({ message: 'A valid reason is required.' });

        const video = await Video.findOne({ id: videoId });
        if (!video) return res.status(404).json({ message: 'Video not found.' });
        if (video.userId === req.user.id) return res.status(400).json({ message: 'You cannot report your own video.' });

        try {
            await new Report({
                id: crypto.randomUUID(),
                reporterId: req.user.id,
                videoId,
                reason,
                detail: typeof detail === 'string' ? detail.trim().slice(0, 500) : undefined,
            }).save();
        } catch (e) {
            if (e && e.code === 11000) return res.status(200).json({ reported: true, alreadyReported: true });
            throw e;
        }

        return res.status(201).json({ reported: true });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    create,
    REASONS,
};
