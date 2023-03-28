const { itemDao } = require("../models");

const getItemDetailsById = async (itemId) => {
  return itemDao.getItemDetailsById(itemId);
};

module.exports = {
  getItemDetailsById,
};
