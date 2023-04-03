const {paymentService} = require("../services");
const {catchAsync} = require("../utils/error");

const getPurchases = catchAsync(async (req, res) => {
  const userId = req.user
  const purchases = await paymentService.getPurchases(userId);
  res.status(200).json({purchases});
})

const getSales = catchAsync(async (req, res) => {
  const userId = req.user
  const sales = await paymentService.getSales(userId);
  res.status(200).json({sales});
})

module.exports = {
  getPurchases,
  getSales,
};

