const Profile = require('../models/Profile');
const User = require('../models/User');
const utils = require('../utils');

async function withBannedFlag(profileJson) {
    const user = await User.findOne({ id: profileJson.id });
    profileJson.banned = !!(user && user.banned);
    return profileJson;
}

const allowedInterests = [
    'Music', 'Dance', 'Comedy', 'Food', 'Travel', 'Fashion', 'Sports', 'Gaming',
    'Art', 'Beauty', 'Education', 'Technology', 'Fitness', 'Lifestyle', 'Nature'
];

const AVATAR_MAX_BYTES = 700 * 1024;
const AVATAR_DATA_URL = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/;

function validateAvatar(avatar) {
    if (typeof avatar !== 'string') return 'Avatar must be a base64 data URL string.';
    if (avatar === '') return null;
    if (!AVATAR_DATA_URL.test(avatar)) return 'Avatar must be a base64-encoded image data URL.';
    if (Buffer.byteLength(avatar, 'utf8') > AVATAR_MAX_BYTES) return 'Avatar image is too large.';
    return null;
}

const getMe = async (req, res) => {
    const profile = await Profile.findOne({ id: req.user.id });
    if (!profile) return res.status(400).json({ error: 'COMPLETE_ONBOARDING', message: 'Onboarding not completed.' });

    const final = profile.toJSON();
    delete final._id;
    delete final.__v;

    return res.status(200).json(final);
}

const completeOnboarding = async (req, res) => {
    const { username, name, avatar, bio, interests } = req.body;

    if (!username) return res.status(400).json({ message: 'Username is required.' });
    if (!name) return res.status(400).json({ message: 'Full name is required.' });

    if (typeof username !== 'string') return res.status(400).json({ message: 'Username must be a string.' });
    if (typeof name !== 'string') return res.status(400).json({ message: 'Full name must be a string.' });
    if (typeof bio !== 'string') return res.status(400).json({ message: 'Bio must be a string.' });

    if (!Array.isArray(interests)) return res.status(400).json({ message: 'Interests must be an array.' });

    const usernameRegex = /^[a-z0-9_.]+$/;

    if (username.length < 3 || username.length > 50) return res.status(400).json({ message: 'Username must be between 3 and 50 characters long.' });
    if (!usernameRegex.test(username)) return res.status(400).json({ message: 'Username must include only lower-case letters, numbers, _ or .' });
    if (utils.hasBadWords(username)) return res.status(400).json({ message: 'Username includes a blacklisted word.' });

    const usernameTaken = await Profile.findOne({ username: username.toLowerCase() });
    if (usernameTaken) return res.status(400).json({ message: 'Username already taken.' });

    if (name.length < 3 || name.length > 50) return res.status(400).json({ message: 'Full name must be between 3 and 50 characters long.' });
    if (utils.hasBadWords(name)) return res.status(400).json({ message: 'Full name includes a blacklisted word.' });

    if (typeof avatar !== 'undefined') {
        const avatarError = validateAvatar(avatar);
        if (avatarError) return res.status(400).json({ message: avatarError });
    }

    const filteredInterests = interests.filter(interest => allowedInterests.includes(interest));

    const profile = await Profile.findOne({ id: req.user.id });
    if (profile) return res.status(400).json({ error: 'CONBOARDING_ALREADY_COMPLETED', message: 'Onboarding already completed.' });

    await new Profile({ id: req.user.id, username: username.toLowerCase(), name, avatar, bio, interests: filteredInterests }).save();

    return res.status(200).json({ message: 'Onboarding completed.' });
}

const editMe = async (req, res) => {
    try {
        const { name, bio, avatar, interests } = req.body || {};

        const updates = {};

        if (typeof name !== 'undefined') {
            if (typeof name !== 'string') return res.status(400).json({ message: 'Full name must be a string.' });
            const trimmed = name.trim();
            if (trimmed.length < 3 || trimmed.length > 50) return res.status(400).json({ message: 'Full name must be between 3 and 50 characters long.' });
            if (utils.hasBadWords(trimmed)) return res.status(400).json({ message: 'Full name includes a blacklisted word.' });
            updates.name = trimmed;
        }

        if (typeof bio !== 'undefined') {
            if (typeof bio !== 'string') return res.status(400).json({ message: 'Bio must be a string.' });
            const trimmed = bio.trim();
            if (trimmed.length > 150) return res.status(400).json({ message: 'Bio must be at most 150 characters long.' });
            updates.bio = trimmed;
        }

        if (typeof avatar !== 'undefined') {
            const avatarError = validateAvatar(avatar);
            if (avatarError) return res.status(400).json({ message: avatarError });
            updates.avatar = avatar;
        }

        if (typeof interests !== 'undefined') {
            if (!Array.isArray(interests)) return res.status(400).json({ message: 'Interests must be an array.' });
            const filtered = interests.filter(interest => allowedInterests.includes(interest));
            updates.interests = filtered;
        }

        if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid fields to update.' });

        const profile = await Profile.findOneAndUpdate(
            { id: req.user.id },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!profile) return res.status(404).json({ message: 'Profile not found.' });

        const final = profile.toJSON();
        delete final._id; delete final.__v;
        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

const getByUsername = async (req, res) => {
    try {
        const username = String(req.params.username || '').toLowerCase().trim();
        if (!username) return res.status(400).json({ message: 'Username is required.' });

        const profile = await Profile.findOne({ username });
        if (!profile) return res.status(404).json({ message: 'Profile not found.' });

        const final = profile.toJSON();
        delete final._id; delete final.__v;
        await withBannedFlag(final);
        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

const getById = async (req, res) => {
    try {
        const id = String(req.params.id || '').trim();
        if (!id) return res.status(400).json({ message: 'User id is required.' });

        const profile = await Profile.findOne({ id });
        if (!profile) return res.status(404).json({ message: 'Profile not found.' });

        const final = profile.toJSON();
        delete final._id; delete final.__v;
        await withBannedFlag(final);
        return res.status(200).json(final);
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

module.exports = {
    getMe,
    editMe,
    completeOnboarding,
    getByUsername,
    getById
};
