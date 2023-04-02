const request = require("supertest");

const { createApp } = require("../../app");
const dataSource = require("../../api/models/dataSource");
const testClient = require("../test-client");
const { usersFixture, itemsFixture, bidsFixture } = require("../fixtures");


describe("Place Order", () => {
  let app;

  const tables = [
    "users",
    "items",
    "categories",
    "materials",
    "items_materials",
    "orders",
    "bids",
    "order_status",
    "shipment",
  ];

  const seller = {
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

  const buyer = {
    id: 2,
    email: "youngsup94@naver.com",
    name: "이영섭",
    password: "youngp94",
    providerId: "7839352922",
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
    sellerId: seller.id,
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
      ' "한국산 달 인공위성인 다누리가 달 주변을 돌며 찍어 보낸 사진입니다."',
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

  const bid = {
    id: 1,
    itemId: item.id,
    buyerId: buyer.id,
    bidPrice: 1500000.0,
    bidPriceChangeRate: 0,
  };

  beforeAll(async () => {
    app = createApp();
    await dataSource.initialize();
    await testClient.createTestDataSet();
    await usersFixture.createUsers([seller, buyer]);
    await itemsFixture.createMaterials([material]);
    await itemsFixture.createCategories([category]);
    await itemsFixture.createItems([item]);
    await itemsFixture.createItemsMaterials([itemMaterial]);
    await bidsFixture.createBids([bid]);
  }, 55000);

  afterAll(async () => {
    await testClient.truncateTables(tables);
    await dataSource.destroy();
  }, 55000);

  test("SUCCESS: order placed ", async () => {
    const response = await request(app).post("/orders").send(
      {
        bidId: 1,
        phoneNumber: "010-1234-5678",
        street: "서울특별시 강남구 테헤란로26길 14",
        address: "위워크빌딩",
        zipcode: "06236",
        price: 1550000.0,
      },
      10000
    );

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({ data: 1 });
  });

  test("FAIL: key error", async () => {
    const response = await request(app).post("/orders").send({
      bidId: 1,
      street: "서울특별시 강남구 테헤란로26길 14",
      address: "위워크빌딩",
      zipcode: "06236",
      price: 1550000.0,
    });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({ message: "KEY_ERROR" });
  }, 10000);

  test("FAIL: invalid phone number", async () => {
    const response = await request(app).post("/orders").send({
      bidId: 1,
      phoneNumber: "010-14-5678",
      street: "서울특별시 강남구 테헤란로26길 14",
      address: "위워크빌딩",
      zipcode: "06236",
      price: 1550000.0,
    });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({ message: "INVALID_PHONE_NUMBER" });
  }, 10000);

  test("FAIL: invalid zipcode", async () => {
    const response = await request(app).post("/orders").send({
      bidId: 1,
      phoneNumber: "010-1234-5678",
      street: "서울특별시 강남구 테헤란로26길 14",
      address: "위워크빌딩",
      zipcode: "1512",
      price: 1550000.0,
    });

    expect(response.status).toEqual(400);
    expect(response.body).toEqual({ message: "INVALID_ZIPCODE" });
  }, 10000);
});
