const express = require("express");

const itemRouter = require("./itemRouter");
const orderRouter = require("./orderRouter");

const router = express.Router();

router.use("/items", itemRouter);
router.use("/orders", orderRouter);

module.exports = router;