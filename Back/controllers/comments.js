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
        const json = comment.toJSON(); delete json._id; delete json.__v;
        const p = await Profile.findOne({ id: req.user.id });
        if (p) { json.username = p.username; json.name = p.name; json.avatar = p.avatar; }
        return res.status(201).json(json);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { listByVideo, create };
