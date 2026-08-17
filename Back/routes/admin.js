const { Router } = require('express');
const router = Router();

const { listReports, resolveReport, deleteReportedVideo, banUser } = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({ admin: req.user.role === 'admin' });
});

router.get('/reports', authMiddleware, adminMiddleware, listReports);
router.post('/reports/:id/resolve', authMiddleware, adminMiddleware, resolveReport);
router.delete('/videos/:videoId', authMiddleware, adminMiddleware, deleteReportedVideo);
router.post('/users/:userId/ban', authMiddleware, adminMiddleware, banUser);

module.exports = router;
