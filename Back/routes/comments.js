const { Router } = require('express');
const router = Router();

const { listByVideo, create } = require('../controllers/comments');
const authMiddleware = require('../middleware/auth');

router.get('/:videoId', listByVideo);
router.post('/:videoId', authMiddleware, create);

module.exports = router;
