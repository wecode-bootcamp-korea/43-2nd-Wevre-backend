const express = require("express");

const userRouter = require("./userRouter");
const itemRouter = require("./itemRouter");
const orderRouter = require("./orderRouter");
const wishlistRouter = require("./wishlistRouter");

const router = express.Router();

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.use("/orders", orderRouter);
router.use("/wishlist", wishlistRouter);

module.exports = router;