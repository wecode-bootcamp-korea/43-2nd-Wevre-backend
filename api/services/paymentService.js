const axios = require("axios");

const { paymentDao, orderDao } = require("../models");
const {
  CID,
  PARTNER_ORDER_ID,
  PARTNER_USER_ID,
  APPROVAL_URL,
  CANCEL_URL,
  FAIL_URL,
  QUANTITY,
  TAX_FREE_AMOUNT
} = require("../utils/kakao");

let tid, orderIdForPayment;

const getPurchases = async (userId) => {
  return await paymentDao.getPurchases(userId);
};

const getSales = async (userId) => {
  return await paymentDao.getSales(userId);
};

const readyKakaoPayment = async (orderId) => {  
  const [order] = await orderDao.getOrderById(orderId);

  const response = await axios.post(
    "https://kapi.kakao.com/v1/payment/ready",
    {
      cid: CID,
      partner_order_id: PARTNER_ORDER_ID,
      partner_user_id: PARTNER_USER_ID,
      item_name: order.item_name,
      quantity: QUANTITY,
      total_amount: ((+order.price) + (+order.fee)),
      tax_free_amount: TAX_FREE_AMOUNT,
      approval_url: APPROVAL_URL,
      cancel_url: CANCEL_URL,
      fail_url: FAIL_URL,
    },
    {
      headers: {
        Authorization: `KakaoAK ${process.env.ADMIN_KEY}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );

  const data = response.data;
  tid = data.tid;
  orderIdForPayment = orderId;
  itemName = order.item_name;
  amount = ((+order.price) + (+order.fee));
  
  return data.next_redirect_pc_url;
};

const approveKakaoPayment = async (userId, pgToken) => {
  const response = await axios.post(
    "https://kapi.kakao.com/v1/payment/approve",
    {
      cid: CID,
      tid: tid,
      partner_order_id: PARTNER_ORDER_ID,
      partner_user_id: PARTNER_USER_ID,
      pg_token: pgToken,
    },
    {
      headers: {
        Authorization: `KakaoAK ${process.env.ADMIN_KEY}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );

  const data = response.data;
  
  const paymentNumber = data.tid;
  const paymentMethod = data.payment_method_type;
  const amount = data.amount;
  const itemName = data.item_name;

  await paymentDao.makePayment(userId, orderIdForPayment, paymentNumber, paymentMethod, itemName, amount);
  const [payment] = await paymentDao.getPaymentByPaymentNumber(paymentNumber);

  return payment;
};

const cancelKakaoPayment = async (tid) => {
  const [payment] = await paymentDao.getPaymentByPaymentNumber(tid);

  console.log(JSON.stringify(payment));

  const response = await axios.post(
    "https://kapi.kakao.com/v1/payment/cancel",
    {
      cid: CID,
      tid: tid,
      cancel_amount: +payment.amount,
      cancel_tax_free_amount: TAX_FREE_AMOUNT,
    },
    {
      headers: {
        Authorization: `KakaoAK ${process.env.ADMIN_KEY}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );

  const data = response.data;
  const status = data.status;
  const amount = data.amount;
  const approvedCancelAmount = data.approved_cancel_amount;
  const canceledAmount = data.canceled_amount;
  const cancelAvailableAmount = data.cancel_available_amount;
  const itemName = data.item_name;
  const quantity = data.quantity;
  const canceledAt = data.canceled_at;
  const approvedAt = data.approved_at;

  const result = {
    tid: tid,
    status: status,
    amount: amount,
    approvedCancelAmount: approvedCancelAmount,
    canceledAmount: canceledAmount,
    cancelAvailableAmount: cancelAvailableAmount,
    itemName: itemName,
    quantity: quantity,
    canceledAt: canceledAt,
    approvedAt: approvedAt
  };

  await paymentDao.deletePayment(tid);

  return result;
}

module.exports = {
  getPurchases,
  getSales,
  readyKakaoPayment,
  approveKakaoPayment,
  cancelKakaoPayment
};
