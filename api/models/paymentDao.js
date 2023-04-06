const dataSource = require("./dataSource");

const getPurchases = async (userId) => {
  return await dataSource.query(
    `SELECT orders.id                                                       AS orderId,
            orders.buyer_id                                                 AS buyerId,
            users.name                                                      AS buyerName,
            items.id                                                        AS itemId,
            items.item_name                                                 AS itemName,
            items.author_name                                               AS authorName,
            items.image_url                                                 AS imageUrl,
            orders.phone_number                                             AS phoneNumber,
            CONCAT(orders.street, " ", orders.address, " ", orders.zipcode) AS totalAddress,
            CONCAT(FORMAT(ROUND(orders.price), 0), "원")                     AS winningBidPrice,
            CONCAT(FORMAT(ROUND(shipment.fee), 0), "원")                     AS shipmentFee,
            CONCAT(FORMAT(ROUND(payment.amount), 0), "원")                   AS totalPrice,
            order_status.name                                               AS orderStatus,
            DATE_FORMAT(orders.created_at, "%Y년 %m월 %d일 %h시 %i분 %s초") AS ordersCreatedAt,
            payment.payment_number                                          AS paymentNumber,
            payment.method_type                                             AS paymentMethodType,
            DATE_FORMAT(payment.created_at, "%Y년 %m월 %d일 %h시 %i분 %s초") AS paymentCreatedAt
     FROM orders
              INNER JOIN users ON users.id = orders.buyer_id
              INNER JOIN shipment ON orders.shipment_id = shipment.id
              INNER JOIN order_status ON orders.order_status_id = order_status.id
              INNER JOIN payment ON payment.order_id = orders.id
              INNER JOIN items ON items.seller_id = orders.seller_id
     WHERE orders.buyer_id = ?
    `,
    [userId]
  );
};

const getSales = async (userId) => {
  return await dataSource.query(`
      SELECT orders.id                                                 AS orderId,
             orders.seller_id                                          AS sellerId,
             users.name                                                AS sellerName,
             items.id                                                  AS itemId,
             items.item_name                                           AS itemName,
             items.author_name                                         AS authorName,
             items.image_url                                           AS imageUrl,
             orders.bid_id                                             AS bidId,
             order_status.name                                         AS orderStatus,
             CONCAT(FORMAT(ROUND(shipment.fee), 0), "원")               AS shipmentFee,
             CONCAT(FORMAT(ROUND(orders.price), 0), "원")               AS price,
             CONCAT(FORMAT(ROUND(payment.amount), 0), "원")             AS totalPrice,
             DATE_FORMAT(orders.created_at, "%Y년 %m월 %d일 %h시 %i분 %s초") AS ordersCreatedAt,
             DATE_FORMAT(payment.created_at, "%Y년 %m월 %d일 %h시 %i분 %s초") AS paymentCreatedAt
      FROM orders
               INNER JOIN users ON users.id = orders.seller_id
               INNER JOIN shipment ON shipment.id = orders.shipment_id
               INNER JOIN order_status ON order_status.id = orders.order_status_id
               INNER JOIN items ON items.seller_id = orders.seller_id
               INNER JOIN payment ON payment.order_id = orders.id
      WHERE orders.seller_id = ?
  `, [userId])
};

const makePayment = async (
  userId,
  orderId,
  paymentNumber,
  methodType,
  itemName,
  amount
) => {
  const payment = await dataSource.query(
    `
    INSERT
    INTO payment (
      user_id,
      order_id,
      payment_number,
      method_type,
      item_name,
      amount
    ) VALUES (?, ?, ?, ?, ?, ?)
  `,
    [userId, orderId, paymentNumber, methodType, itemName, amount]
  );

  return payment.insertId;
};

const getPaymentByPaymentNumber = async (paymentNumber) => {
  return await dataSource.query(
    `
    SELECT
      user_id,
      order_id,
      payment_number,
      method_type,
      item_name,
      amount
    FROM payment
    WHERE payment_number = ? 
  `,
    [paymentNumber]
  );
};

const deletePayment = async (paymentNumber) => {
  const deleteRows = (
    await dataSource.query(`
      DELETE 
      FROM payment
      WHERE payment_number = ?
    `, [paymentNumber])
  ).affectedRows;

  if (deleteRows !== 1) {
    throw new Error(("INVALID_INPUT"));
  }

  return deletePayment;
}

module.exports = {
  getPurchases,
  getSales,
  makePayment,
  getPaymentByPaymentNumber,
  deletePayment
};
