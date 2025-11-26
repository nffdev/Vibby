const Comment = require('../models/Comment');
const Profile = require('../models/Profile');
const utils = require('../utils');

const listByVideo = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });
        const comments = await Comment.find({ videoId }).sort({ createdAt: 1 }).limit(500);
        const userIds = [...new Set(comments.map(c => c.userId).filter(Boolean))];
        const profiles = userIds.length ? await Profile.find({ id: { $in: userIds } }) : [];
        const byId = new Map(profiles.map(p => [p.id, p]));
        const final = comments.map(c => {
            const json = c.toJSON(); delete json._id; delete json.__v;
            json.id = String(c._id);
            const p = byId.get(json.userId);
            if (p) {
                json.username = p.username;
                json.name = p.name;
                json.avatar = p.avatar;
            }
            return json;
        });
        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const create = async (req, res) => {
    try {
        const videoId = String(req.params.videoId || '').trim();
        const { text } = req.body || {};
        if (!videoId) return res.status(400).json({ message: 'Video id is required.' });
        if (typeof text !== 'string') return res.status(400).json({ message: 'Text must be a string.' });
        const trimmed = text.trim();
        if (!trimmed) return res.status(400).json({ message: 'Text is required.' });
        if (trimmed.length > 300) return res.status(400).json({ message: 'Text must be at most 300 characters long.' });
        if (utils.hasBadWords(trimmed)) return res.status(400).json({ message: 'Text includes a blacklisted word.' });

        const comment = new Comment({ videoId, userId: req.user.id, text: trimmed });
        await comment.save();
        const json = comment.toJSON(); delete json._id; delete json.__v; json.id = String(comment._id);
        const p = await Profile.findOne({ id: req.user.id });
        if (p) { json.username = p.username; json.name = p.name; json.avatar = p.avatar; }
        return res.status(201).json(json);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const counts = async (req, res) => {
    try {
        let ids = req.query.ids;
        if (!ids) return res.status(200).json({});
        if (typeof ids === 'string') ids = ids.split(',').map(s => String(s).trim()).filter(Boolean);
        if (Array.isArray(ids)) ids = ids.map(s => String(s).trim()).filter(Boolean);
        if (!Array.isArray(ids) || ids.length === 0) return res.status(200).json({});
        const agg = await Comment.aggregate([
            { $match: { videoId: { $in: ids } } },
            { $group: { _id: '$videoId', count: { $sum: 1 } } }
        ]);
        const out = {};
        for (const a of agg) out[a._id] = a.count;
        return res.status(200).json(out);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const remove = async (req, res) => {
    try {
        const id = String(req.params.commentId || '').trim();
        if (!id) return res.status(400).json({ message: 'Comment id is required.' });
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Comment not found.' });
        if (String(comment.userId) !== String(req.user.id)) return res.status(403).json({ message: 'Forbidden.' });
        await Comment.deleteOne({ _id: comment._id });
        return res.status(200).json({ deleted: true });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { listByVideo, create, counts, remove };

