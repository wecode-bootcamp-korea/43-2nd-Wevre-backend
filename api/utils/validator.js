const { BID_STATUS_ID } = require("./enum");

const validatePhoneNumber = async (phoneNumber) => {
  const phoneNumberRegex = /^([0-9]{3})[-]([0-9]{4})[-][0-9]{4}$/;

  if (!phoneNumberRegex.test(phoneNumber)) {
    const error = new Error("INVALID_PHONE_NUMBER");
    error.statusCode = 400;

    throw error;
  }
};

const validateZipcode = async (zipcode) => {
  const zipcodeRegex = /^[0-9]{5}$/;

  if (!zipcodeRegex.test(zipcode)) {
    const error = new Error("INVALID_ZIPCODE");
    error.statusCode = 400;

    throw error;
  }
};

const checkIfBidEnded = (bidStatus) => {

  return bidStatus === BID_STATUS_ID.낙찰완료 || bidStatus === BID_STATUS_ID.경매종료;
};

module.exports = {
  validatePhoneNumber,
  validateZipcode,
  checkIfBidEnded,
};
