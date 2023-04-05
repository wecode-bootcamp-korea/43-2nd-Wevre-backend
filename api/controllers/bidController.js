const { bidService } = require("../services");
const { catchAsync } = require("../utils/error");

const getBidsByBuyerIdAndItemId = catchAsync(async (req, res) => {
  const buyerId = req.user;
  const itemId = +req.params.itemId;

  if (!itemId) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  const data = await bidService.getBidsByBuyerIdAndItemId(buyerId, itemId);

  return res.status(200).json({ data });
});

module.exports = {
  getBidsByBuyerIdAndItemId,
};
