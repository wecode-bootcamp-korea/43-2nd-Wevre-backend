const express = require("express");

const { wishlistController } = require("../controllers");

const router = express.Router();

router.post("/items/:itemId", wishlistController.addWishlist);
router.get("", wishlistController.getWishlist);

module.exports = router;