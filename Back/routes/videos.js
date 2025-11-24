const { Router } = require('express');
const router = Router();

const { createVideo, listVideos, resolveVideo } = require('../controllers/videos');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createVideo);
router.get('/', listVideos);
router.get('/:id/resolve', resolveVideo);

module.exports = router;
