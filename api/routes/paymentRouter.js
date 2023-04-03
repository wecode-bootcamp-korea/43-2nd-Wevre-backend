const express = require("express");
const { paymentController } = require("../controllers");
const {loginRequired} = require("../utils/auth");

const router = express.Router();

router.get("/purchases", loginRequired, paymentController.getPurchases);
router.get("/sales", loginRequired, paymentController.getSales);

module.exports = router;
