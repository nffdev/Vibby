const { Router } = require('express');
const router = Router();

const { search } = require('../controllers/search');

router.get('/', search);

module.exports = router;
