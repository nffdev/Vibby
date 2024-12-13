const Profile = require('../models/Profile');

const getMe = async (req, res) => {
    const profile = await Profile.findOne({ id: req.user.id });
    if (!profile) return res.status(400).json({ error: 'COMPLETE_ONBOARDING', message: 'Onboarding not completed.' });

    const final = profile.toJSON();
    delete final._id;
    delete final.__v;

    return res.status(200).json(final);
}

const completeOnboarding = async (req, res) => {
    const { } = req.body;

    return res.status(400).json({ error: 'NOT_IMPLEMENTED', message: 'Not implemented.' });
}

const editMe = async (req, res) => {
    const { } = req.body;

    return res.status(400).json({ error: 'NOT_IMPLEMENTED', message: 'Not implemented.' });
}

module.exports = {
    getMe,
    editMe,
    completeOnboarding
};