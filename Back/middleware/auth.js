const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ message: 'Unauthorized.' });

    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : authorization;

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    const user = await User.findOne({ id: payload.sub });
    if (!user) return res.status(401).json({ message: 'Unauthorized.' });

    if ((user.tokenVersion || 0) !== (payload.ver || 0)) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    req.user = user.toJSON();
    delete req.user._id;
    delete req.user.__v;

    next();
}
