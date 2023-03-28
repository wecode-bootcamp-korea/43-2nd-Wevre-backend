const dataSource = require("./dataSource");
const itemDao = require("./itemDao");
const bidDao = require("./bidDao");

const { ORDER_STATUS_ID, SHIPPING_FEE } = require("../utils/enum");
const { calculateShippingFee } = require("../utils/shippingFeeCalculator");

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
      INTO orders (
        buyer_id,
        seller_id,
        shipment_id,
        bid_id,
        order_status_id,
        phone_number,
        street,
        address,
        zipcode,
        price
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
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
  addOrder,
};
