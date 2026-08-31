const View = require('../models/View');

const markView = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });

        await View.updateOne(
            { userId: req.user.id, videoId },
            { $setOnInsert: { userId: req.user.id, videoId, createdAt: new Date() } },
            { upsert: true }
        );

        return res.status(200).json({ ok: true });
    } catch (e) {
        if (e && e.code === 11000) return res.status(200).json({ ok: true });
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { markView };
