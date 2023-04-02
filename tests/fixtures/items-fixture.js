const dataSource = require("../../api/models/dataSource");

const createItems = async (itemList) => {
  let data = [];

  for (const item of itemList) {
    data.push([
      item.id,
      item.sellerId,
      item.categoryId,
      item.itemName,
      item.authorName,
      item.productionYear,
      item.width,
      item.length,
      item.height,
      item.weight,
      item.adminNumber,
      item.description,
      item.imageUrl,
      item.startingBid,
      item.biddingStart,
      item.biddingEnd,
    ]);
  }

  return await dataSource.query(
    `
    INSERT INTO items (
      id,
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
    ) VALUES ?
  `,
    [data]
  );
};

const createCategories = async (categoryList) => {
  let data = [];

  for (const category of categoryList) {
    data.push([category.id, category.name]);
  }

  return await dataSource.query(
    `
    INSERT INTO categories (
      id,
      name
    ) VALUES ?
  `,
    [data]
  );
};

const createItemsMaterials = async (itemMaterialList) => {
  let data = [];

  for (const itemMaterial of itemMaterialList) {
    data.push([itemMaterial.id, itemMaterial.itemId, itemMaterial.materialId]);
  }

  return await dataSource.query(
    `
    INSERT INTO items_materials (
      id,
      item_id,
      material_id
    ) VALUES ?
  `,
    [data]
  );
};

const createMaterials = async (materialList) => {
  let data = [];

  for (const material of materialList) {
    data.push([material.id, material.name]);
  }

  return await dataSource.query(
    `
    INSERT INTO materials (
      id,
      name
    ) VALUES ?
  `,
    [data]
  );
};

module.exports = {
  createItems,
  createCategories,
  createItemsMaterials,
  createMaterials,
};