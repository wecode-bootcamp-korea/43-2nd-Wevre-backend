const {ItemQueryBuilder} = require('./itemQueryBuilder');
const date = require('../bidDao')
const dataSource = require("../dataSource");

const getItems = async (limit, offset, category, sorting, authorName, itemName) => {
  const filterQuery = new ItemQueryBuilder(
    limit, offset, category, sorting, authorName, itemName
  ).build();

  const itemData = await dataSource.query(`
      SELECT items.id                                                    AS id,
             items.seller_id                                             AS sellerId,
             users.name                                                  AS sellerName,
             categories.name                                             AS categoryName,
             items.item_name                                             AS itemName,
             items.author_name                                           AS authorName,
             CONCAT(items.production_year, "년")                          AS productionYear,
             CONCAT(items.width, "cm")                                   AS width,
             CONCAT(items.length, "cm")                                  AS length,
             CONCAT(items.height, "cm")                                  AS height,
             CONCAT(ROUND(items.weight, 3), "kg")                        AS weight,
             (SELECT JSON_ARRAYAGG(materials.name)
              FROM materials
                       INNER JOIN items_materials ON items_materials.material_id = materials.id
              WHERE items_materials.item_id = items.id)                  AS materialsName,
             items.admin_number                                          AS adminNumber,
             items.description,
             items.image_url                                             AS imageUrl,
             CONCAT(FORMAT(ROUND(items.starting_bid), 0), "원")           AS startingBid,
             DATE_FORMAT(items.bidding_start, "%Y년 %m월 %d일 %h시 %i분 %s초") AS biddingStart,
             DATE_FORMAT(items.bidding_end, "%Y년 %m월 %d일 %h시 %i분 %s초")   AS biddingEnd,
             bid_status.status                                           AS bidStatus,
             DATE_FORMAT(items.created_at, "%Y년 %m월 %d일 %h시 %i분 %s초")    AS createdAt
      FROM items
               INNER JOIN users ON users.id = items.seller_id
               INNER JOIN categories ON categories.id = items.category_id
               INNER JOIN bid_status ON bid_status.id = items.bid_status_id
          ${filterQuery}
  `);

  for (let item of itemData) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_now = new Date(utc + (KR_TIME_DIFF) * 2)


    const [biddingTime] = await dataSource.query(`SELECT bidding_start, bidding_end
                                                  FROM items
                                                  WHERE id = ?`, item["id"])

    const startDate = new Date(biddingTime["bidding_start"])
    const startDateNow = new Date(startDate.getTime() + KR_TIME_DIFF)

    const endDate = new Date(biddingTime["bidding_end"])
    const endDateNow = new Date(endDate.getTime() + KR_TIME_DIFF)

    const [bidId] = await dataSource.query(`
        SELECT id
        FROM bids
        WHERE item_id = ?`, [item["id"]])

    let result = ""
    if (!bidId) {
      result = false
    } else {
      result = true
    }

    if (kr_now < startDateNow) {
      await dataSource.query(`
          UPDATE items
          SET bid_status_id=1
          WHERE id = ?
      `, [item["id"]])
    }

    if (kr_now < endDateNow) {
      await dataSource.query(`
          UPDATE items
          SET bid_status_id=2
          WHERE id = ?
      `, [item["id"]])
    }


    if ((kr_now >= endDateNow) && result) {
      await dataSource.query(`
          UPDATE items
          SET bid_status_id=3
          WHERE id = ?
      `, [item["id"]])
    }

    if ((kr_now >= endDateNow) && !result) {
      await dataSource.query(`
          UPDATE items
          SET bid_status_id=4
          WHERE id = ?
      `, [item["id"]])
    }

    await date.changeIsShow(item["id"])

  }


  return itemData;
}

const findCategoryId = async (categoryName) => {
  const categoryId = await dataSource.query(`
      SELECT id
      FROM categories
      WHERE name = ?`, [categoryName])
  return categoryId[0]["id"]
}

const calculateBiddingEnd = async (biddingStart, biddingTerm) => {
  const date = new Date(biddingStart)
  const krDate = new Date(date.getTime())
  return new Date(krDate.getTime() + biddingTerm * 24 * 60 * 60 * 1000)
}

const isRegistered = async (userId) => {
  const [result] = await dataSource.query(`
      SELECT artist_registration
      FROM users
      WHERE id = ?`, [userId])
  return !!(result["artist_registration"])
}

const registerItem = async (userId, imageUrl, categoryId, itemName, authorName, productionYear, width, length,
                            height, weight, materials, adminNumber, description, startingBid, biddingStartDate, biddingEnd) => {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.query(`
        INSERT INTO items (seller_id, category_id, item_name, author_name, production_year, width, length, height,
                           weight, admin_number, description, image_url, starting_bid, bidding_start, bidding_end)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, categoryId, itemName, authorName, productionYear, width, length, height, weight, adminNumber, description,
      imageUrl, startingBid, biddingStartDate, biddingEnd])
    const materialsArr = materials.replace(/\s+/g, '').split(',')

    const materialIds = [];
    for (let material of materialsArr) {
      const [materialId] = await queryRunner.query(`
          SELECT id
          FROM materials
          WHERE name = ?
      `, [material])
      materialIds.push(materialId)
    }

    const [itemId] = await queryRunner.query(`SELECT id
                                              FROM items
                                              WHERE admin_number = ?`, [adminNumber])
    const materialIdArr = [];
    for (let materialId of materialIds) {
      materialIdArr.push([itemId["id"], materialId["id"]])
    }
    await queryRunner.query(`
        INSERT INTO items_materials (item_id, material_id)
        VALUES ?
    `, [materialIdArr]);
    await queryRunner.commitTransaction();
  } catch (err) {
    queryRunner.rollbackTransaction();
    const error = new Error("INVALID_DATA_INPUT");
    error.statusCode = 500;
    throw error;
  } finally {
    await queryRunner.release();
  }
}


const getItemDetailsById = async (itemId) => {
    return dataSource.query(
        `
    SELECT
      i.author_name AS author_name,
      i.item_name AS item_name,
      i.production_year AS production_year,
      imj.materials AS materials,
      i.width AS width,
      i.length AS length,
      i.height AS height,
      i.weight AS weight,
      i.description AS description,
      i.starting_bid AS starting_bid,
      i.image_url AS image_url
    FROM items AS i
    JOIN (
      SELECT
        item_id,
        JSON_ARRAYAGG(m.name) AS materials
      FROM items_materials AS im
      JOIN materials AS m ON m.id = im.material_id
      GROUP BY item_id
    ) imj ON imj.item_id = i.id
    WHERE i.id = ?
  `,
        [itemId]
    );
}

const getItemById = async (itemId) => {
    return await dataSource.query(
        `
    SELECT
      seller_id,
      category_id,
      item_name,
      author_name,
      production_year,
      width,
      length,
      height,
      weight,
      admin_number,
      description,
      image_url,
      starting_bid,
      bidding_start,
      bidding_end
    FROM items
    WHERE id = ?
  `,
        [itemId]
    );
};

const getAllBidStatus = async () => {
    return dataSource.query(`
      SELECT 
        id,
        bid_status_id
      FROM items
    `);
  }
  
const getBidStatusByItemId = async (itemId) => {
    return dataSource.query(`
      SELECT 
        bid_status_id
      FROM items
      WHERE id = ?
    `, [itemId]);
}

module.exports = {
    getItems,
    findCategoryId,
    calculateBiddingEnd,
    isRegistered,
    registerItem,
    getItemDetailsById,
    getItemById,
    getAllBidStatus,
    getBidStatusByItemId
}


