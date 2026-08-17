const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const register = async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    // if (!username) return res.status(400).json({ message: 'Username is required.' });
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    if (!confirmPassword) return res.status(400).json({ message: 'You must confirm your password.' });
    if (password !== confirmPassword) return res.status(400).json({ message: 'Passwords are not matching.' });

    // const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,15}$/;
    // if (!usernameRegex.test(username)) return res.status(400).json({ message: 'The provided username is invalid.' });

    // const existingUsername = await User.findOne({ username });
    // if (existingUsername) return res.status(400).json({ message: 'Username already in use.' });

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'The provided email is invalid.' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already in use.' });

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // if (!passwordRegex.test(password)) return res.status(400).json({ message: 'The password must contain at least 8 characters, including at least one uppercase letter, one lowercase letter, one number and one special character.' });

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({ id: crypto.randomUUID(), email, password: hashedPassword });
    await user.save();

    return res.json({ token: signToken(user) });
}

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });

    const existing = await User.findOne({ email });

    if (!existing) return res.status(400).json({ message: 'Email or password is invalid.' });
    if (!existing.password) return res.status(400).json({ message: 'Email or password is invalid.' });
    if (!bcrypt.compareSync(password, existing.password)) return res.status(400).json({ message: 'Email or password is invalid.' });

    return res.json({ token: signToken(existing) });
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