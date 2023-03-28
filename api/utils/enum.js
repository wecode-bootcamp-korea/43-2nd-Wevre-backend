const ORDER_STATUS_ID = Object.freeze({
  결제완료: 1,
  상품준비: 2,
  배송대기중: 3,
  출고완료: 4,
  배송중: 5,
  배송완료: 6,
});

const SHIPPING_FEE = Object.freeze({
  250000: 1,
  200000: 2,
  150000: 3,
  100000: 4,
  50000: 5,
});

module.exports = {
  ORDER_STATUS_ID,
  SHIPPING_FEE
};
