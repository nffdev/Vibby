const { Router } = require('express');
const router = Router();

const { toggle, listMe } = require('../controllers/dislikes');
const authMiddleware = require('../middleware/auth');

router.post('/:videoId', authMiddleware, toggle);
router.get('/me', authMiddleware, listMe);

module.exports = router;
