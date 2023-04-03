const {paymentDao} = require("../models");

const getPurchases = async (userId) => {
  return await paymentDao.getPurchases(userId);
};

const getSales = async (userId) => {
  return await paymentDao.getSales(userId);
};

module.exports = {
  getPurchases,
  getSales,
};
