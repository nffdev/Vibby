const Follow = require('../models/Follow');
const Profile = require('../models/Profile');

const toggle = async (req, res) => {
    try {
        const targetId = String(req.params.id || '').trim();
        if (!targetId) return res.status(400).json({ message: 'User id is required.' });
        if (targetId === req.user.id) return res.status(400).json({ message: 'Cannot follow yourself.' });

        const existing = await Follow.findOne({ followerId: req.user.id, userId: targetId });
        if (existing) {
            await Follow.deleteOne({ _id: existing._id });

            const me = await Profile.findOne({ id: req.user.id });
            const you = await Profile.findOne({ id: targetId });
            if (me) { me.following = Math.max(0, (typeof me.following === 'number' ? me.following : 0) - 1); await me.save(); }
            if (you) { you.followers = Math.max(0, (typeof you.followers === 'number' ? you.followers : 0) - 1); await you.save(); }

            return res.status(200).json({ following: false });
        }

        await new Follow({ followerId: req.user.id, userId: targetId }).save();

        const me = await Profile.findOne({ id: req.user.id });
        const you = await Profile.findOne({ id: targetId });
        if (me) { me.following = (typeof me.following === 'number' ? me.following : 0) + 1; await me.save(); }
        if (you) { you.followers = (typeof you.followers === 'number' ? you.followers : 0) + 1; await you.save(); }

        return res.status(200).json({ following: true });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const listFollowers = async (req, res) => {
    try {
        const userId = String(req.params.id || '').trim();
        if (!userId) return res.status(400).json({ message: 'User id is required.' });

        const followers = await Follow.find({ userId }).sort({ createdAt: -1 }).limit(200);
        const followerIds = followers.map(f => f.followerId);
        const profiles = followerIds.length ? await Profile.find({ id: { $in: followerIds } }) : [];

        const myFollowing = await Follow.find({ followerId: req.user.id });
        const myFollowingSet = new Set(myFollowing.map(f => f.userId));

        const final = profiles.map(p => {
            const json = p.toJSON();
            delete json._id; delete json.__v;
            json.isFollowing = myFollowingSet.has(json.id);
            return json;
        });

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const listFollowing = async (req, res) => {
    try {
        const userId = String(req.params.id || '').trim();
        if (!userId) return res.status(400).json({ message: 'User id is required.' });

        const following = await Follow.find({ followerId: userId }).sort({ createdAt: -1 }).limit(200);
        const targetIds = following.map(f => f.userId);
        const profiles = targetIds.length ? await Profile.find({ id: { $in: targetIds } }) : [];

        const myFollowing = await Follow.find({ followerId: req.user.id });
        const myFollowingSet = new Set(myFollowing.map(f => f.userId));

        const final = profiles.map(p => {
            const json = p.toJSON();
            delete json._id; delete json.__v;
            json.isFollowing = myFollowingSet.has(json.id);
            return json;
        });

        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

const relationship = async (req, res) => {
    try {
        const otherId = String(req.params.id || '').trim();
        if (!otherId) return res.status(400).json({ message: 'User id is required.' });
        if (otherId === req.user.id) return res.status(200).json({ i_follow: false, follows_me: false });

        const iFollow = await Follow.findOne({ followerId: req.user.id, userId: otherId });
        const followsMe = await Follow.findOne({ followerId: otherId, userId: req.user.id });

        return res.status(200).json({ i_follow: !!iFollow, follows_me: !!followsMe });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { toggle, listFollowers, listFollowing, relationship };
