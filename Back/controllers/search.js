const Video = require('../models/Video');
const Profile = require('../models/Profile');

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const search = async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        if (q.length < 2) return res.status(200).json({ videos: [], users: [] });

        const rx = new RegExp(escapeRegex(q), 'i');

        const [videos, profiles] = await Promise.all([
            Video.find({
                playback_id: { $exists: true, $ne: null },
                $or: [{ title: rx }, { description: rx }],
            }).sort({ createdAt: -1, _id: -1 }).limit(20),
            Profile.find({ $or: [{ username: rx }, { name: rx }] }).limit(20),
        ]);

        const userIds = [...new Set(videos.map(v => v.userId).filter(Boolean))];
        const owners = userIds.length ? await Profile.find({ id: { $in: userIds } }) : [];
        const usernameById = new Map(owners.map(p => [p.id, p.username]));

        const videoResults = videos.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            userId: v.userId,
            username: usernameById.get(v.userId),
            playback_id: v.playback_id,
        }));

        const userResults = profiles.map(p => ({
            id: p.id,
            username: p.username,
            name: p.name,
            avatar: p.avatar,
        }));

        return res.status(200).json({ videos: videoResults, users: userResults });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { search };
