const { paymentService, orderService } = require("../services");
const { catchAsync } = require("../utils/error");
const { REDIRECT_URL } = require("../utils/kakao");

let globalBuyerId;

const getPurchases = catchAsync(async (req, res) => {
  const buyerId = req.user;
  const purchases = await paymentService.getPurchases(buyerId);

  res.status(200).json({ purchases });
});

const getSales = catchAsync(async (req, res) => {
  const buyerId = req.user;
  const sales = await paymentService.getSales(buyerId);

  res.status(200).json({ sales });
});

const readyKakaoPayment = catchAsync(async (req, res) => {
  const buyerId = req.user;
  globalUserId = buyerId;
  const { bidId, phoneNumber, street, address, zipcode, price } = req.body;

  if (!bidId || !phoneNumber || !street || !address || !zipcode || !price) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  rawPrice = price.replace(/[원,]/g, "");

  const orderId = await orderService.addOrder(
    buyerId,
    bidId,
    phoneNumber,
    street,
    address,
    zipcode,
    rawPrice
  );

  const nextRedirectPcUrl = await paymentService.readyKakaoPayment(orderId);

  return res.status(200).json({ data: nextRedirectPcUrl });
});

const approveKakaoPayment = catchAsync(async (req, res) => {
  const buyerId = globalBuyerId;

  const pgToken = req.query.pg_token;

  if (!pgToken) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  await paymentService.approveKakaoPayment(buyerId, pgToken);

  return res.redirect(REDIRECT_URL);
});

const cancelKakaoPaymentBefore = catchAsync(async (req, res) => {
  return res.redirect(REDIRECT_URL);
});

const cancelKakaoPaymentAfter = catchAsync(async (req, res) => {
  const tid = req.body.tid;

  if (!tid) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  const data = await paymentService.cancelKakaoPayment(tid);

  return res.status(200).json({ data });
});

module.exports = {
  getPurchases,
  getSales,
  readyKakaoPayment,
  approveKakaoPayment,
  cancelKakaoPaymentBefore,
  cancelKakaoPaymentAfter,
};
