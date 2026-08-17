const { Router } = require('express');
const router = Router();

const { create } = require('../controllers/reports');
const authMiddleware = require('../middleware/auth');

router.post('/:videoId', authMiddleware, create);

module.exports = router;
