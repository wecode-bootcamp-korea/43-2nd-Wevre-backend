const dataSource = require("./dataSource");

const getBidById = async (bidId) => {
  return await dataSource.query(
    `
    SELECT
      item_id,
      buyer_id,
      bid_price,
      bid_price_change_rate
    FROM bids
    WHERE id = ?
  `,
    [bidId]
  );
};

module.exports = {
  getBidById,
};
