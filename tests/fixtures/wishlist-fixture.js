const dataSource = require("../../api/models/dataSource");

const createWishlist = async (wishlistList) => {
  let data = [];

  for (const wishlist of wishlistList) {
    data.push([wishlist.id, wishlist.userId, wishlist.itemId]);
  }

  return await dataSource.query(
    `
    INSERT INTO wishlist (
      id,
      user_id,
      item_id
    ) VALUES ?
  `,
    [data]
  );
};

module.exports = { createWishlist };
