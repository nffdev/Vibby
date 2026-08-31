const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, 
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again later.' },
});

const writeLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 60, 
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Slow down.' },
});

module.exports = { authLimiter, writeLimiter };
