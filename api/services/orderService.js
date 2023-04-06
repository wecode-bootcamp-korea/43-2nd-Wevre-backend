const { orderDao } = require("../models");
const { validatePhoneNumber, validateZipcode } = require("../utils/validator");

const getOrders = async (userId, itemId) => {
  const shippingFee = await orderDao.getShippingFee(itemId)
  return await orderDao.getOrders(userId, itemId, shippingFee);
};

const addOrder = async (
  buyerId,
  bidId,
  phoneNumber,
  street,
  address,
  zipcode,
  price
) => {
  await validatePhoneNumber(phoneNumber);
  await validateZipcode(zipcode);

  return await orderDao.addOrder(
    buyerId,
    bidId,
    phoneNumber,
    street,
    address,
    zipcode,
    price
  );
};

const getOrderById = async (orderId) => {
  return orderDao.getOrderById(orderId);
};

module.exports = {
  getOrders,
  addOrder,
  getOrderById,
};
