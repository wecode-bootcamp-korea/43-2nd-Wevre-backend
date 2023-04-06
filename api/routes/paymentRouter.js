const express = require("express");
const { paymentController } = require("../controllers");
const { loginRequired } = require("../utils/auth");

const router = express.Router();

router.get("/purchases", loginRequired, paymentController.getPurchases);
router.get("/sales", loginRequired, paymentController.getSales);
router.post("/kakao/ready", loginRequired, paymentController.readyKakaoPayment);
router.get("/kakao/approval", loginRequired, paymentController.approveKakaoPayment);
router.get("/kakao/cancelation", loginRequired, paymentController.cancelKakaoPaymentBefore);
router.post("/kakao/cancelation", loginRequired, paymentController.cancelKakaoPaymentAfter);

module.exports = router;