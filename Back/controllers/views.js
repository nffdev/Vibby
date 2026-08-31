const View = require('../models/View');
const Video = require('../models/Video');

const markView = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });

        const result = await View.updateOne(
            { userId: req.user.id, videoId },
            { $setOnInsert: { userId: req.user.id, videoId, createdAt: new Date() } },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            await Video.updateOne({ id: videoId }, { $inc: { viewCount: 1 } });
        }

        return res.status(200).json({ ok: true });
    } catch (e) {
        if (e && e.code === 11000) return res.status(200).json({ ok: true });
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { markView };
