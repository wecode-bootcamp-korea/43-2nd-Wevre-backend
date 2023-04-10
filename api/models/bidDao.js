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

const isPassedOneDayAfterBiddingEnd = async (itemId) => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const kr_now = new Date(utc + KR_TIME_DIFF * 2);

  const [biddingEnd] = await dataSource.query(
    `
        SELECT bidding_end
        FROM items
        WHERE id = ?
    `,
    [itemId]
  );

  const endDate = new Date(biddingEnd["bidding_end"]);
  const oneDayAfterEndDate = new Date(
    endDate.getTime() + KR_TIME_DIFF + 60 * 1000
  );

  if (oneDayAfterEndDate < kr_now) {
    return true;
  }
  return false;
};

const getPaymentId = async (userId, itemId) => {
  const amount = await dataSource.query(
    `
        SELECT payment.amount
        FROM payment
                 INNER JOIN orders ON orders.id = payment.order_id
                 INNER JOIN bids ON bids.id = orders.bid_id
        WHERE payment.user_id = ?
          AND bids.item_id = ?`,
    [userId, itemId]
  );
  if (amount.length !== 0) {
    const [paymentId] = await dataSource.query(
      `
        SELECT payment.id
        FROM payment
                 INNER JOIN orders ON payment.order_id = orders.id
                 INNER JOIN bids ON orders.bid_id = bids.id
        WHERE bids.bid_price = ?
          AND payment.user_id = ?
          AND bids.item_id = ?`,
      [amount[0]["amount"], userId, itemId]
    );

    console.log(!!paymentId["id"]);
    return !!paymentId["id"];
  }
};

const isPassedOneDayAfterPayment = async (userId, itemId) => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
  const kr_now = new Date(utc + KR_TIME_DIFF);

  const amount = await dataSource.query(
    `
        SELECT payment.amount
        FROM payment
                 INNER JOIN orders ON orders.id = payment.order_id
                 INNER JOIN bids ON bids.id = orders.bid_id
        WHERE payment.user_id = ?
          AND bids.item_id = ?`,
    [userId, itemId]
  );
  if (amount.length !== 0) {
    const paymentId = await dataSource.query(
      `
        SELECT payment.id
        FROM payment
                 INNER JOIN orders ON payment.order_id = orders.id
                 INNER JOIN bids ON orders.bid_id = bids.id
        WHERE bids.bid_price = ?
          AND payment.user_id = ?
          AND bids.item_id = ?`,
      [amount[0]["amount"], userId, itemId]
    );

    const paymentDate = await dataSource.query(
      `
          SELECT created_at
          FROM payment
          WHERE id = ?`,
      paymentId[0]["id"]
    );

    const endDate = new Date(paymentDate[0]["created_at"]);
    const oneDayAfterEndDate = new Date(
      endDate.getTime() + KR_TIME_DIFF + 60 * 1000
    );

    if (oneDayAfterEndDate < kr_now) {
      return true;
    }
    return false;
  }
};

const bidStatus = async (itemId) => {
  const [bidStatus] = await dataSource.query(
    `SELECT bid_status_id FROM items WHERE id = ?`,
    [itemId]
  );
  return bidStatus["bid_status_id"];
};

const changeIsShow = async (itemId) => {
  if (
    (await bidStatus(itemId)) === 4 &&
    (await isPassedOneDayAfterBiddingEnd(itemId)) === true
  ) {
    await dataSource.query(
      ` UPDATE items
        SET is_show = 1
        WHERE id = ?
      `,
      [itemId]
    );
  }
};

const changeIsShowIfPaid = async (itemId, userId) => {
  if (
    (await bidStatus(itemId)) === 3 &&
    (await isPassedOneDayAfterBiddingEnd(itemId)) === true
  ) {
    await dataSource.query(
      ` UPDATE items
        SET is_show = 1
        WHERE id = ?
      `,
      [itemId]
    );
  }
  if ((await bidStatus(itemId)) === 3 && (await getPaymentId(userId, itemId))) {
    await dataSource.query(
      ` UPDATE items
        SET is_show = 1
        WHERE id = ?
      `,
      [itemId]
    );
  }
};

const getBidsByBuyerId = async (buyerId) => {
  const bids = await dataSource.query(
    `
      SELECT id      AS bidId,
             item_id AS itemId
      FROM bids
      WHERE buyer_id = ?
  `,
    [buyerId]
  );

  let bidTable = {};
  for (let bid of bids) {
    if (!bidTable.hasOwnProperty(bid["itemId"])) {
      bidTable[bid["itemId"]] = bid["bidId"];
    } else {
      bidTable[bid["itemId"]] = bid["bidId"];
    }
  }

  let bidIdArr = Object.values(bidTable);

  let itemIdArr = [];
  for (let bidId of bidIdArr) {
    const [itemId] = await dataSource.query(
      `SELECT item_id
                                             FROM bids
                                             WHERE id = ?`,
      [bidId]
    );
    itemIdArr.push(itemId);
  }

  let newBidIdArr = [];
  for (let itemId of itemIdArr) {
    await changeIsShowIfPaid(itemId["item_id"], buyerId);
    const [newBidId] = await dataSource.query(
      `
        SELECT id
        FROM bids
        WHERE item_id = ?
          AND is_show = 0`,
      itemId["item_id"]
    );
    newBidIdArr.push(newBidId);
  }

  const existingBidIdArr = newBidIdArr.filter((id) => id !== undefined);

  let userBids = [];
  for (let bidId of existingBidIdArr) {
    userBids.push(
      await dataSource.query(
        `
        SELECT bids.id                                                   AS bidId,
               bids.item_id                                              AS itemId,
               items.item_name                                           AS itemName,
               items.author_name                                         AS authorName,
               items.image_url                                           AS imageUrl,
               DATE_FORMAT(items.bidding_end, "%Y년 %m월 %d일 %h시 %i분 %s초") AS biddingEnd,
               bid_status.status                                         AS bidStatus,
               CONCAT(FORMAT(ROUND(items.starting_bid), 0), "원")         AS startingBid,
               CONCAT(FORMAT(ROUND((SELECT MAX(bid_price)
                                    FROM bids
                                    WHERE buyer_id = ?
                                      AND item_id = (SELECT item_id FROM bids WHERE id = ?))), 0),
                      "원")                                               AS myLastBidPrice,
               CONCAT(FORMAT(ROUND(bids.bid_price), 0), "원")             AS currentPrice
        FROM bids
                 INNER JOIN items ON items.id = bids.item_id
                 INNER JOIN bid_status ON bid_status.id = items.bid_status_id
        WHERE bids.id = ?
    `,
        [buyerId, bidId["id"], bidId["id"]]
      )
    );
  }

  userBids.sort((a, b) => {
    if (a[0]["bidId"] < b[0]["bidId"]) return 1;
    if (a[0]["bidId"] > b[0]["bidId"]) return -1;
    return 0;
  });

  const result = userBids.map(([bid]) => {
    return { ...bid };
  });
  return result;
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

const deleteWebSocketServerByItemId = async (itemId) => {
  try {
    await dataSource.query(
      `
        DELETE
        FROM websocket_servers
        WHERE item_id = ?
      `,
      [itemId]
    );
  } catch (err) {
    console.log(`DELETE_WEBSOCKET_SERVER_ERROR: ${err}`);
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

const getBidsByBuyerIdAndItemId = async (buyerId, itemId) => {
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
    `,
      [buyerId, itemId]
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
    console.log(`GET_BIDS_BY_BUYER_ID_AND_ITEM_ID_ERROR: ${err}`);
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
  getPaymentId,
  isPassedOneDayAfterBiddingEnd,
  changeIsShow,
  changeIsShowIfPaid,
  getBidsByBuyerId,
  makeBids,
  getBidById,
  getWebSocketServerByItemId,
  setWebSocketServerByItemId,
  deleteWebSocketServerByItemId,
  getBidsByBuyerIdAndItemId,
  calculateBidChangeRate,
  checkIfHighestBidderBidsAgain,
};
