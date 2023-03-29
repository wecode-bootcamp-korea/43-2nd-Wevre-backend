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

const getWishlist = async (userId) => {
  return dataSource.query(`
    SELECT 
      i.author_name AS author_name,
      i.item_name AS item_name,
      i.production_year AS production_year,
      imj.materials AS materials,
      i.width AS width,
      i.length AS length,
      i.height AS height,
      i.weight AS weight,
      i.description AS description,
      i.starting_bid AS starting_bid,
      i.image_url AS image_url
    FROM wishlist AS w
    JOIN items AS i ON w.item_id = i.id
    JOIN (
      SELECT
        item_id,
        JSON_ARRAYAGG(m.name) AS materials
      FROM items_materials AS im
      JOIN materials AS m ON m.id = im.material_id
      GROUP BY item_id
    ) imj ON imj.item_id = i.id
    WHERE w.user_id = ?
  `, [userId]);
};

module.exports = {
  addWishlist,
  getWishlist,
};