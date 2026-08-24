const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');

module.exports = async (req, res, next) => {
    req.user = null;

    const { authorization } = req.headers;
    if (!authorization) return next();

    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : authorization;

    let payload;
    try {
        payload = verifyToken(token);
    } catch {
        return next();
    }

    try {
        const user = await User.findOne({ id: payload.sub });
        if (!user) return next();
        if (user.banned) return next();
        if ((user.tokenVersion || 0) !== (payload.ver || 0)) return next();

        const json = user.toJSON();
        delete json._id;
        delete json.__v;
        req.user = json;
    } catch { }

    next();
};
