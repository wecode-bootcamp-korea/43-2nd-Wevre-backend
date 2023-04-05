const express = require("express");

const { orderController } = require("../controllers");
const {loginRequired} = require("../utils/auth");

const router = express.Router();

router.post("", loginRequired, orderController.addOrder);
router.get("/:itemId", loginRequired, orderController.getOrders);

module.exports = router;
