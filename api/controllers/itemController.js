const { itemService } = require("../services");
const { catchAsync } = require("../utils/error");

const getItems = catchAsync(async (req, res) => {
  const items = await itemService.getItems(req.query);

  return res.status(200).json({ items });
});

const registerItem = catchAsync(async (req, res) => {
  const sellerId = req.user;
  const imageUrl = req.file.location;

  const result = await itemService.registerItem(sellerId, imageUrl, req.body);
  if (!result) {
    return res.status(200).json({ message: "ARTIST_REGISTRATION_REQUIRED" });
  }
  return res
    .status(201)
    .json({ message: "SUCCESSFULLY_REGISTERED", url: req.file.location });
});

const getItemDetailsById = catchAsync(async (req, res) => {
  const itemId = +req.params.itemId;

  if (!itemId) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  const data = await itemService.getItemDetailsById(itemId);

  return res.status(200).json({ data });
});

module.exports = {
  getItems,
  registerItem,
  getItemDetailsById,
};
