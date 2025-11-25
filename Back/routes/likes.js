const { Router } = require('express');
const router = Router();

const { toggle, listMe, listUser } = require('../controllers/likes');
const authMiddleware = require('../middleware/auth');

router.post('/:videoId', authMiddleware, toggle);
router.get('/me', authMiddleware, listMe);
router.get('/user/:id', listUser);

module.exports = router;
