const { Router } = require('express');
const router = Router();

const { listByVideo, create, counts, remove } = require('../controllers/comments');
const authMiddleware = require('../middleware/auth');

router.get('/counts', counts);
router.get('/:videoId', listByVideo);
router.post('/:videoId', authMiddleware, create);
router.delete('/:commentId', authMiddleware, remove);

module.exports = router;
