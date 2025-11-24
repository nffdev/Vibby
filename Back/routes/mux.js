const { Router } = require('express');
const router = Router();

const { webhook } = require('../controllers/mux');

router.post('/webhook', webhook);

module.exports = router;
