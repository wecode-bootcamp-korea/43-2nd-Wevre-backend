const express = require("express");

const { itemController } = require("../controllers");
const upload = require("../utils/imageUpload");
const { loginRequired } = require("../utils/auth");

const router = express.Router();

router.get("", itemController.getItems);
router.post(
  "",
  loginRequired,
  upload.imageUploader.single("image"),
  itemController.registerItem
);
router.get("/:itemId", itemController.getItemDetailsById);

module.exports = router;
