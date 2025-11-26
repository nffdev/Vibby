const { Router } = require('express');
const router = Router();

const { toggle, listFollowers, listFollowing, relationship } = require('../controllers/follows');
const authMiddleware = require('../middleware/auth');

router.post('/:id', authMiddleware, toggle);
router.get('/followers/:id', authMiddleware, listFollowers);
router.get('/following/:id', authMiddleware, listFollowing);
router.get('/relationship/:id', authMiddleware, relationship);

module.exports = router;
