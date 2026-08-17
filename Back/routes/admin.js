const { Router } = require('express');
const router = Router();

const { listReports, resolveReport, deleteReportedVideo, banUser, listBannedUsers, unbanUser } = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({ admin: req.user.role === 'admin' });
});

router.get('/reports', authMiddleware, adminMiddleware, listReports);
router.post('/reports/:id/resolve', authMiddleware, adminMiddleware, resolveReport);
router.delete('/videos/:videoId', authMiddleware, adminMiddleware, deleteReportedVideo);
router.post('/users/:userId/ban', authMiddleware, adminMiddleware, banUser);
router.get('/banned', authMiddleware, adminMiddleware, listBannedUsers);
router.post('/users/:userId/unban', authMiddleware, adminMiddleware, unbanUser);

module.exports = router;
