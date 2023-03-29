const { wishlistDao } = require("../models");

const addWishlist = async (userId, itemId) => {
  return wishlistDao.addWishlist(userId, itemId);
};

module.exports = {
  addWishlist,
};
