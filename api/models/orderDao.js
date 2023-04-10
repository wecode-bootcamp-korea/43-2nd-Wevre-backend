const dataSource = require("./dataSource");
const itemDao = require("./itemDao/itemDao");
const bidDao = require("./bidDao");

const { ORDER_STATUS_ID, SHIPPING_FEE } = require("../utils/enum");
const { calculateShippingFee } = require("../utils/shippingFeeCalculator");

const getShippingFee = async (itemId) => {
  const [itemInfo] = await dataSource.query(
    `
      SELECT width, length, height, weight
      FROM items
      WHERE id = ?
  `,
    [itemId]
  );

  const volume = itemInfo["width"] * itemInfo["length"] * itemInfo["height"];

  return calculateShippingFee(volume, itemInfo["weight"]);
};

const getOrders = async (buyerId, itemId, shippingFee) => {
  return await dataSource.query(
    `
      SELECT bids.id                                                          AS bidId,
             users.name                                                       AS userName,
             users.email                                                      AS userEmail,
             items.item_name                                                  AS itemName,
             items.author_name                                                AS authorName,
             items.image_url                                                  AS imageUrl,
             CONCAT(FORMAT(ROUND(bids.bid_price), 0), "원")                    AS bidPrice,
             CONCAT(FORMAT(ROUND(?), 0), "원")                    AS shippingFee,
             CONCAT(FORMAT(ROUND((bids.bid_price + (?))), 0), "원") AS totalPrice
      FROM bids
               INNER JOIN items
                          ON items.id = bids.item_id
               INNER JOIN users ON bids.buyer_id = users.id
      WHERE buyer_id = ?
        AND item_id = ?
  `,
    [shippingFee, shippingFee, buyerId, itemId]
  );
};

const addOrder = async (
  buyerId,
  bidId,
  phoneNumber,
  street,
  address,
  zipcode,
  price
) => {
  const [bid] = await bidDao.getBidById(bidId);
  const [item] = await itemDao.getItemById(+bid.item_id);

  const volume = item.width * item.length * item.height;

  const fee = calculateShippingFee(volume, item.weight);

  const shipment_id = SHIPPING_FEE[fee];

  const order = await dataSource.query(
    `
            INSERT
            INTO orders (buyer_id,
                         seller_id,
                         shipment_id,
                         bid_id,
                         order_status_id,
                         phone_number,
                         street,
                         address,
                         zipcode,
                         price)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
    [
      buyerId,
      +item.seller_id,
      shipment_id,
      bidId,
      ORDER_STATUS_ID.결제완료,
      phoneNumber,
      street,
      address,
      zipcode,
      price,
    ]
  );

  return order.insertId;
};

const getOrderById = async (orderId) => {
  return dataSource.query(
    `
    SELECT
      o.buyer_id AS buyer_id,
      o.seller_id AS seller_id,
      o.shipment_id AS shipment_id,
      o.bid_id AS bid_id,
      o.order_status_id AS order_status_id,
      o.phone_number AS phone_number,
      o.street AS street,
      o.address AS address,
      o.zipcode AS zipcode,
      o.price AS price,
      i.item_name AS item_name,
      s.fee AS fee
    FROM orders AS o
    JOIN bids AS b ON o.bid_id = b.id
    JOIN items AS i ON i.id = b.item_id
    JOIN shipment AS s on s.id = o.shipment_id 
    WHERE o.id = ?
  `,
    [orderId]
  );
};

module.exports = {
  getShippingFee,
  getOrders,
  addOrder,
  getOrderById,
};
