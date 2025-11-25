const { Router } = require('express');
const router = Router();

const { createVideo, listVideos, resolveVideo, listMyVideos, listUserVideos } = require('../controllers/videos');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createVideo);
router.get('/', listVideos);
router.get('/:id/resolve', resolveVideo);
router.get('/me', authMiddleware, listMyVideos);
router.get('/user/:id', listUserVideos);

module.exports = router;
