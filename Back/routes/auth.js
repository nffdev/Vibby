const { Router } = require('express');
const router = Router();

const { register, login, googleAuth } = require('../controllers/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);

module.exports = router;