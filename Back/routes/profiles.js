const { Router } = require('express');
const router = Router();

const { getMe, completeOnboarding, editMe, getByUsername, getById } = require('../controllers/profiles');

const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, getMe);
router.post('/onboarding', authMiddleware, completeOnboarding);
router.post('/me', authMiddleware, editMe);
router.get('/id/:id', getById);
router.get('/:username', getByUsername);

module.exports = router;
