const { itemDao } = require("../models/itemDao");
const generateAdminNumber = require("../utils/generate");

const getItems = async (params) => {
  const { limit, offset, category, sorting, authorName, itemName } = params;
  return itemDao.getItems(
    limit,
    offset,
    category,
    sorting,
    authorName,
    itemName
  );
};

const registerItem = async (sellerId, imageUrl, params) => {
  const {
    categoryName,
    itemName,
    authorName,
    productionYear,
    width,
    length,
    height,
    weight,
    materials,
    description,
    startingBid,
    biddingStart,
    biddingTerm,
  } = params;

  const categoryId = await itemDao.findCategoryId(categoryName);
  const adminNumber = await generateAdminNumber.generateAdminNumber();
  const biddingStartDate = String(
    biddingStart.substring(0, 4) +
      "-" +
      biddingStart.substring(4, 6) +
      "-" +
      biddingStart.substring(6, 8) +
      " 00:00:00"
  );
  const biddingEnd = await itemDao.calculateBiddingEnd(
    biddingStartDate,
    biddingTerm
  );

  if (!(await itemDao.isRegistered(sellerId))) return false;
  await itemDao.registerItem(
    sellerId,
    imageUrl,
    categoryId,
    itemName,
    authorName,
    productionYear,
    width,
    length,
    height,
    weight,
    materials,
    adminNumber,
    description,
    startingBid,
    biddingStartDate,
    biddingEnd
  );
  return true;
};

const getItemDetailsById = async (itemId) => {
  return itemDao.getItemDetailsById(itemId);
};

const getAllBidStatus = async () => {
  return itemDao.getAllBidStatus();
};

const getBidStatusByItemId = async (itemId) => {
  return itemDao.getBidStatusByItemId(itemId);
};

module.exports = {
  getItems,
  registerItem,
  getItemDetailsById,
  getAllBidStatus,
  getBidStatusByItemId,
};
