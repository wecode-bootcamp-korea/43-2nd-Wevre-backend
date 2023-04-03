const dataSource = require("./dataSource");
const itemDao = require("./itemDao");
const bidDao = require("./bidDao");

const {ORDER_STATUS_ID, SHIPPING_FEE} = require("../utils/enum");
const {calculateShippingFee} = require("../utils/shippingFeeCalculator");

const getShippingFee = async (itemId) => {
    const [itemInfo] = await dataSource.query(`
      SELECT width, length, height, weight
      FROM items
      WHERE id = ?
  `, [itemId])
    const volume = itemInfo["width"] * itemInfo["length"] * itemInfo["height"]
    return calculateShippingFee(volume, itemInfo["weight"])
}

const getOrders = async (userId, itemId, shippingFee) => {
    return await dataSource.query(`
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
  `, [shippingFee, shippingFee, userId, itemId])
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

    const fee = calculateShippingFee(
        volume,
        item.weight
    );

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

module.exports = {
    getShippingFee,
    getOrders,
    addOrder,
};
