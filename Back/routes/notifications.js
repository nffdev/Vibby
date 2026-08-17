const { Router } = require('express');
const router = Router();

const { listMine, unreadCount, markAllRead } = require('../controllers/notifications');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, listMine);
router.get('/unread', authMiddleware, unreadCount);
router.post('/read', authMiddleware, markAllRead);

module.exports = router;
