const { Router } = require('express');
const router = Router();

const { markView } = require('../controllers/views');
const authMiddleware = require('../middleware/auth');

router.post('/:videoId', authMiddleware, markView);

module.exports = router;
