const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const register = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (typeof email !== 'string' || !email) return res.status(400).json({ message: 'Email is required.' });
        if (typeof password !== 'string' || !password) return res.status(400).json({ message: 'Password is required.' });
        if (typeof confirmPassword !== 'string' || !confirmPassword) return res.status(400).json({ message: 'You must confirm your password.' });
        if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords are not matching.' });

        const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!emailRegex.test(email)) return res.status(400).json({ message: 'The provided email is invalid.' });

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ message: 'Email already in use.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ id: crypto.randomUUID(), email, password: hashedPassword });
        await user.save();

        return res.json({ token: signToken(user) });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== 'string' || !email) return res.status(400).json({ message: 'Email is required.' });
        if (typeof password !== 'string' || !password) return res.status(400).json({ message: 'Password is required.' });

        const existing = await User.findOne({ email });

        if (!existing) return res.status(400).json({ message: 'Email or password is invalid.' });
        if (!existing.password) return res.status(400).json({ message: 'Email or password is invalid.' });
        if (!await bcrypt.compare(password, existing.password)) return res.status(400).json({ message: 'Email or password is invalid.' });

        return res.json({ token: signToken(existing) });
    } catch {
        return res.status(500).json({ message: 'Server error.' });
    }
}

const googleAuth = async (req, res) => {
    const { credential } = req.body;

    if (!credential) return res.status(400).json({ message: 'Google credential is required.' });
    if (!googleClient) return res.status(500).json({ message: 'Google authentication is not configured.' });

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
    } catch {
        return res.status(401).json({ message: 'Invalid Google credential.' });
    }

    const email = payload?.email;
    const googleId = payload?.sub;
    if (!email || !googleId) return res.status(401).json({ message: 'Invalid Google credential.' });

    let user = await User.findOne({ googleId });
    if (!user) user = await User.findOne({ email });

    if (user) {
        if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }
        return res.json({ token: signToken(user) });
    }

    user = new User({ id: crypto.randomUUID(), email, googleId });
    await user.save();

    return res.json({ token: signToken(user) });
}

module.exports = {
    login,
    register,
    googleAuth
};