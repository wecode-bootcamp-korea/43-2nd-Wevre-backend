const express = require("express");

const { wishlistController } = require("../controllers");
const { loginRequired } = require("../utils/auth");

const router = express.Router();

router.post("/items/:itemId", loginRequired, wishlistController.addWishlist);
router.get("", loginRequired, wishlistController.getWishlist);

module.exports = router;