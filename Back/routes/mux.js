const express = require('express');
const { Router } = express;
const router = Router();

const { webhook } = require('../controllers/mux');
const verifyMuxSignature = require('../middleware/muxWebhook');

router.post('/webhook', express.raw({ type: '*/*' }), verifyMuxSignature, webhook);

module.exports = router;
