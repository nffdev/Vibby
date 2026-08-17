const crypto = require('node:crypto');
const Notification = require('../models/Notification');
const Profile = require('../models/Profile');

async function createNotification({ userId, actorId, type, videoId }) {
    try {
        if (!userId || !actorId || userId === actorId) return;
        await new Notification({
            id: crypto.randomUUID(),
            userId,
            actorId,
            type,
            videoId,
        }).save();
    } catch { }
}

const listMine = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        const actorIds = [...new Set(notifications.map(n => n.actorId).filter(Boolean))];
        const profiles = actorIds.length ? await Profile.find({ id: { $in: actorIds } }) : [];
        const actorById = new Map(profiles.map(p => [p.id, p]));

        const final = notifications.map(n => {
            const actor = actorById.get(n.actorId);
            return {
                id: n.id,
                type: n.type,
                videoId: n.videoId,
                read: n.read,
                createdAt: n.createdAt,
                actor: actor
                    ? { id: actor.id, username: actor.username, name: actor.name, avatar: actor.avatar }
                    : { id: n.actorId },
            };
        });

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const unreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, read: false });
        return res.status(200).json({ count });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
        return res.status(200).json({ ok: true });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    createNotification,
    listMine,
    unreadCount,
    markAllRead,
};
