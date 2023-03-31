const { wishlistDao } = require("../models");

const addWishlist = async (userId, itemId) => {
  const result = await wishlistDao.checkIfWishlistExists(userId, itemId);

  if (!result) {
    return wishlistDao.addWishlist(userId, itemId);
  } else {
    return wishlistDao.deleteWishlist(userId, itemId);
  }
};

const getWishlist = async (userId) => {
  return wishlistDao.getWishlist(userId);
};

module.exports = {
  addWishlist,
  getWishlist,
};
