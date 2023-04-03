const { itemDao } = require("../models/itemDao");
const generateAdminNumber = require("../utils/generate")

const getItems = async (params) => {
  const {
    limit,
    offset,
    category,
    sorting,
    authorName,
    itemName
  } = params;
  return await itemDao.getItems(limit, offset, category, sorting, authorName, itemName);
};

const registerItem = async (userId, imageUrl, params) => {
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
    biddingTerm
  } = params

  const categoryId = await itemDao.findCategoryId(categoryName)
  const adminNumber = await generateAdminNumber.generateAdminNumber()
  const biddingEnd = await itemDao.calculateBiddingEnd(biddingStart, biddingTerm)

  if (!await itemDao.isRegistered(userId)) return false
  await itemDao.registerItem(userId, imageUrl, categoryId, itemName, authorName, productionYear, width,
    length, height, weight, materials, adminNumber, description, startingBid, biddingStart, biddingEnd)
  return true
}

const getItemDetailsById = async (itemId) => {
  return itemDao.getItemDetailsById(itemId);
};

module.exports = {
  getItems,
  registerItem,
  getItemDetailsById,
};
