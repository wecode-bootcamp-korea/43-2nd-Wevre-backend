const request = require("supertest");

const { createApp } = require("../../app");
const dataSource = require("../../api/models/dataSource");
const testClient = require("../test-client");
const { usersFixture, itemsFixture } = require("../fixtures");

describe("Read Item Details", () => {
  let app;

  const tables = [
    "users",
    "items",
    "categories",
    "materials",
    "items_materials",
  ];

  const user = {
    id: 1,
    email: "changsup96@naver.com",
    name: "이창섭",
    password: "changsup96",
    providerId: "2186574589",
    bankName: "국민",
    bankAccount: "102-987-456254",
    artistRegistration: "IGA-421",
    bidAgreement: true,
  };

  const category = {
    id: 1,
    name: "회화",
  };

  const material = {
    id: 1,
    name: "고해상도흑백카메라",
  };

  const item = {
    id: 1,
    sellerId: user.id,
    categoryId: category.id,
    authorName: "진코딩",
    itemName: "다누리가 찍은 달",
    productionYear: 2023,
    width: 100.0,
    length: 100.0,
    height: 3.0,
    weight: 3.0,
    adminNumber: "AVED951351",
    description:
      "한국산 달 인공위성인 다누리가 달 주변을 돌며 찍어 보낸 사진입니다.",
    startingBid: 1351300.0,
    imageUrl: "https://wevre.s3.ap-northeast-2.amazonaws.com/Items/20.avif",
    biddingStart: "2023-03-28 00:00:00",
    biddingEnd: "2023-04-04 00:00:00",
  };

  const itemMaterial = {
    id: 1,
    itemId: item.id,
    materialId: material.id,
  };

  beforeAll(async () => {
    app = createApp();
    await dataSource.initialize();
    await usersFixture.createUsers([user]);
    await itemsFixture.createMaterials([material]);
    await itemsFixture.createCategories([category]);
    await itemsFixture.createItems([item]);
    await itemsFixture.createItemsMaterials([itemMaterial]);
  }, 35000);

  afterAll(async () => {
    await testClient.truncateTables(tables);
    await dataSource.destroy();
  }, 35000);

  test("SUCCESS: existent item read", async () => {
    const response = await request(app).get("/items/1");

    expect(response.status).toEqual(200);
    expect(response.body.data[0].author_name).toEqual("진코딩");
  });

  test("FAIL: non-existent item read", async () => {
    const response = await request(app).get("/items/100");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ data: [] });
  });

  test("FAIL: not found", async () => {
    const response = await request(app).get("/items/");

    expect(response.status).toEqual(404);
  });
});
