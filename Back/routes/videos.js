const { Router } = require('express');
const router = Router();

const { createVideo, listVideos, resolveVideo, listMyVideos, listUserVideos, deleteVideo } = require('../controllers/videos');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createVideo);
router.get('/', listVideos);
router.get('/:id/resolve', resolveVideo);
router.get('/me', authMiddleware, listMyVideos);
router.get('/user/:id', listUserVideos);
router.delete('/:id', authMiddleware, deleteVideo);

module.exports = router;
