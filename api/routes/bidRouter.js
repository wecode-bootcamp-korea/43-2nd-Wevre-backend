const express = require("express");

const { bidController } = require("../controllers");

const router = express.Router();

router.get("/items/:itemId", bidController.getBidsByBuyerIdAndItemId);

module.exports = router;
