const { orderDao } = require("../models");
const { validatePhoneNumber, validateZipcode } = require("../utils/validator");

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

module.exports = {
  addOrder,
};
