const { Router } = require('express');
const router = Router();

const { listByVideo, create, counts, remove } = require('../controllers/comments');
const authMiddleware = require('../middleware/auth');
const { writeLimiter } = require('../middleware/rateLimit');

router.get('/counts', counts);
router.get('/:videoId', listByVideo);
router.post('/:videoId', authMiddleware, writeLimiter, create);
router.delete('/:commentId', authMiddleware, writeLimiter, remove);

module.exports = router;
