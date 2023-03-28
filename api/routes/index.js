const express = require("express");

const itemRouter = require("./itemRouter");

const router = express.Router();

router.use("/items", itemRouter);

module.exports = router;
