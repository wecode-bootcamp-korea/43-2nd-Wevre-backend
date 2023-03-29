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

const getWebSocketServerByItemId = async (itemId) => {
  try {
    return dataSource.query(
      `
        SELECT server
        FROM websocket_servers
        WHERE item_id = ?
      `,
      [itemId]
    );
  } catch (err) {
    console.log(`GET_WEBSOCKET_SERVER_ERROR: ${err}`);
  }
};

const setWebSocketServerByItemId = async (itemId, server) => {
  try {
    const webSocketServer = await dataSource.query(
      `
        INSERT IGNORE
        INTO websocket_servers (
          item_id,
          server
        ) VALUES (?, ?)
      `,
      [itemId, server]
    );

    return webSocketServer.insertId;
  } catch (err) {
    console.log(`SET_WEBSOCKET_SERVER_ERROR: ${err}`);
  }
};

const makeBids = async (itemId, buyerId, bidPrice) => {
  try {
    const bid = await dataSource.query(
      `
    INSERT 
    INTO bids (
      item_id,
      buyer_id,
      bid_price
    ) VALUES (?, ?, ?)
  `, 
    [itemId, buyerId, bidPrice]
  );
  
    return bid.insertId;
  } catch (err) {
    console.log(`MAKE_BIDS_ERROR: ${err}`);
  }
};

const getBidsByBuyerIdAndItemId = async (itemId, buyerId) => {
  try {
    const [highestBid] = await dataSource.query(
      `
        SELECT MAX(bid_price) AS highest_bid
        FROM bids
        WHERE item_id = ?
      `,
      [itemId]
    );

    const [lastBid] = await dataSource.query(
      `
        SELECT bid_price AS last_bid
        FROM bids
        WHERE buyer_id = ? AND item_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `, [buyerId, itemId]
    );

    const bids = await dataSource.query(
      `
        SELECT
          bid_price AS price,
          bid_price_change_rate AS price_change_rate
        FROM bids
        WHERE item_id = ?
      `,
      [itemId]
    );

    return [highestBid, lastBid, bids];
  } catch (err) {
    console.log(`GET_BIDS_ERROR: ${err}`);
  }
};

const calculateBidChangeRate = async (itemId) => {
  try {
    const bids = await dataSource.query(
      `
        SELECT
          bid_price AS price
        FROM bids
        WHERE item_id = ?
        ORDER BY created_at DESC
        LIMIT 2
      `,
      [itemId]
    );

    const currentBid = bids[0];
    const previousBid = bids.length == 2 ? bids[1] : null;

    const [item] = await dataSource.query(
      `
        SELECT
          starting_bid
        FROM items
        WHERE id = ?
      `,
      [itemId]
    );

    let previousBidPrice;
    if (bids.length === 1) {
      previousBidPrice = item.starting_bid;
    } else {
      previousBidPrice = previousBid.price;
    }

    const changeRate =
      ((currentBid.price - previousBidPrice) / previousBidPrice) * 100;

    const updatedRows = (
      await dataSource.query(
        `
          UPDATE bids AS ob
          JOIN (
            SELECT 
              item_id, 
              MAX(created_at) AS max_created_at
            FROM bids
            WHERE item_id = ?
            GROUP BY item_id
          ) AS ib ON ob.item_id = ib.item_id AND ob.created_at = ib.max_created_at
          SET ob.bid_price_change_rate = ?
        `,
        [itemId, changeRate]
      )
    ).affectedRows;

    if (updatedRows !== 1) {
      throw new Error("INVALID_INPUT");
    }

    return updatedRows;
  } catch (err) {
    console.log(`SET_CALCULATE_BID_CHANGE_ERROR: ${err}`);
  }
};

const checkIfHighestBidderBidsAgain = async (itemId, buyerId) => {
  try {
    const [highestBid] = await dataSource.query(
      `
        SELECT 
          bid_price AS price, 
          (SELECT buyer_id FROM bids WHERE item_id = ? AND bid_price = price) AS buyer_id
        FROM bids
        WHERE item_id = ?
        ORDER BY bid_price DESC 
        LIMIT 1;
      `,
      [itemId, itemId]
    );

    if (!highestBid || buyerId !== +highestBid.buyer_id) {
      return false;
    }

    return true;
  } catch (err) {
    console.log(`CHECK_HIGHEST_BIDDER_BIDS_AGAIN_ERROR: ${err}`);
  }
};

module.exports = {
  makeBids,
  getBidById,
  getWebSocketServerByItemId,
  setWebSocketServerByItemId,
  makeBids,
  getBidsByBuyerIdAndItemId,
  calculateBidChangeRate,
  checkIfHighestBidderBidsAgain,
};
