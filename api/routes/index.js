const express = require("express");

const userRouter = require("./userRouter");
const itemRouter = require("./itemRouter");
const orderRouter = require("./orderRouter");
const wishlistRouter = require("./wishlistRouter");
const paymentRouter = require("./paymentRouter");
const bidRouter = require("./bidRouter");

const router = express.Router();

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.use("/orders", orderRouter);
router.use("/wishlist", wishlistRouter);
router.use("/payments", paymentRouter);
router.use("/bids", bidRouter);

module.exports = router;