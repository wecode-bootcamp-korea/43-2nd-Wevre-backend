const express = require("express");

const { wishlistController } = require("../controllers");

const router = express.Router();

router.post("/items/:itemId", wishlistController.addWishlist);

module.exports = router;
