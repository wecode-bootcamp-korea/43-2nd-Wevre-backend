const express = require('express');

const itemRouter = require('./itemRouter');
const orderRouter = require('./orderRouter');
const wishlistRouter = require('./wishlistRouter');
const wsRouter = require('./wsRouter');

const router = express.Router();

router.use('/items', itemRouter);
router.use('/orders', orderRouter);
router.use('/wishlist', wishlistRouter);
router.use('/ws', wsRouter);

module.exports = router;
