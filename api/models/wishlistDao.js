const dataSource = require("./dataSource");

const addWishlist = async (userId, itemId) => {
  const wishlist = await dataSource.query(`
    INSERT IGNORE
    INTO wishlist (
      user_id,
      item_id
    ) VALUES (?, ?)
    `, [userId, itemId]
  );

  return wishlist.insertId;
};

module.exports = {
  addWishlist,
};
