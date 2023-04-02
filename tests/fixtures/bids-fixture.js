const dataSource = require("../../api/models/dataSource");

const createBids = async (bidList) => {
  let data = [];

  for (const bid of bidList) {
    data.push([
      bid.id,
      bid.itemId,
      bid.buyerId,
      bid.bidPrice,
      bid.bidPriceChangeRate,
    ]);
  }

  return await dataSource.query(
    `
    INSERT INTO bids (
      id,
      item_id,
      buyer_id,
      bid_price,
      bid_price_change_rate
    ) VALUES ?
  `,
    [data]
  );
};

module.exports = { createBids };
