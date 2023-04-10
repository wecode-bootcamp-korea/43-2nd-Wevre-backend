const express = require("express");

const { bidController } = require("../controllers");
const { loginRequired } = require("../utils/auth");

const router = express.Router();

router.get("/items/:itemId", bidController.getBidsByBuyerIdAndItemId);
router.get("", loginRequired, bidController.getBidsByBuyerId);

module.exports = router;
