const { Router } = require('express');
const router = Router();

const { getUploadUrl } = require('../controllers/uploads');

const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, getUploadUrl);

module.exports = router;