const { wishlistDao } = require("../models");

const addWishlist = async (userId, itemId) => {
  return wishlistDao.addWishlist(userId, itemId);
};

const getWishlist = async (userId) => {
  return wishlistDao.getWishlist(userId);
};

module.exports = {
  addWishlist,
  getWishlist,
};