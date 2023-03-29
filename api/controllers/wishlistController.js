const { wishlistService } = require("../services");
const { catchAsync } = require("../utils/error");

const addWishlist = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const itemId = +req.params.itemId;

  if (!itemId) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  const data = await wishlistService.addWishlist(userId, itemId);

  return res.status(201).json({ data });
});

const getWishlist = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const data = await wishlistService.getWishlist(userId);

  return res.status(200).json({ data });
});

module.exports = {
  addWishlist,
  getWishlist,
};