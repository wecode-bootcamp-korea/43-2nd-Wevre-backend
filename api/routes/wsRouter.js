const express = require('express');

const { wsController } = require('../controllers');
const { authForWs } = require('../utils/auth');

const router = express.Router();

router.ws('/bidding/:itemId', authForWs, wsController.bidItem);

module.exports = router;
