const { Router } = require('express');
const router = Router();

const { register, login, googleAuth } = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

module.exports = router;