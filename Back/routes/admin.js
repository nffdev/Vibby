const { Router } = require('express');
const router = Router();

const { listReports, resolveReport, deleteReportedVideo } = require('../controllers/admin');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/me', authMiddleware, (req, res) => {
    res.status(200).json({ admin: req.user.role === 'admin' });
});

router.get('/reports', authMiddleware, adminMiddleware, listReports);
router.post('/reports/:id/resolve', authMiddleware, adminMiddleware, resolveReport);
router.delete('/videos/:videoId', authMiddleware, adminMiddleware, deleteReportedVideo);

module.exports = router;
