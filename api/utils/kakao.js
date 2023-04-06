const CID = "TC0ONETIME";
const PARTNER_ORDER_ID = "wevre-order-id";
const PARTNER_USER_ID = "wevre-user-id";
const APPROVAL_URL = `http://${process.env.HOST}:${process.env.PORT}/payment/kakao/approval`;
const CANCEL_URL = `http://${process.env.HOST}:${process.env.PORT}/payment/kakao/cancelation`;
const FAIL_URL = `http://${process.env.HOST}:${process.env.PORT}/payment/kakao/fail`;
const REDIRECT_URL = `http://localhost:3000/`;
const QUANTITY = 1;
const TAX_FREE_AMOUNT = 0;

module.exports = {
  CID,
  PARTNER_ORDER_ID,
  PARTNER_USER_ID,
  APPROVAL_URL,
  CANCEL_URL,
  FAIL_URL,
  REDIRECT_URL,
  QUANTITY,
  TAX_FREE_AMOUNT
};
