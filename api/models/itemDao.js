const dataSource = require("./dataSource");

const getItemDetailsById = async (itemId) => {
  return dataSource.query(
    `
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
    FROM items AS i
    JOIN (
      SELECT
        item_id,
        JSON_ARRAYAGG(m.name) AS materials
      FROM items_materials AS im
      JOIN materials AS m ON m.id = im.material_id
      GROUP BY item_id
    ) imj ON imj.item_id = i.id
    WHERE i.id = ?
  `,
    [itemId]
  );
};

module.exports = {
  getItemDetailsById,
};
