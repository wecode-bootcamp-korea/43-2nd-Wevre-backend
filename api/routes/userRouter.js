const express = require("express");
const { userController } = require("../controllers");
const {loginRequired} = require("../utils/auth");

const router = express.Router();

router.get("/auth/kakao/callback", userController.kakaoSignIn);
router.get("", loginRequired, userController.getUser);
router.patch("/buyer", loginRequired, userController.registerBuyer);
router.patch("/seller", loginRequired, userController.registerSeller);

module.exports = router;

