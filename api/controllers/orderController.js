const { orderService } = require("../services");
const { catchAsync } = require("../utils/error");

const getOrders = catchAsync (async (req, res) => {
  const userId = req.user
  const {itemId} = req.params;
  const orders = await orderService.getOrders(userId, itemId);
  res.status(200).json({orders});
})

const addOrder = catchAsync(async (req, res) => {
  const buyerId = req.user.id;
  const { bidId, phoneNumber, street, address, zipcode, price } = req.body;

  if (!bidId || !phoneNumber || !street || !address || !zipcode || !price) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  const data = await orderService.addOrder(
    buyerId,
    bidId,
    phoneNumber,
    street,
    address,
    zipcode,
    price
  );

  return res.status(201).json({ data });
});

module.exports = {
  getOrders,
  addOrder,
};
