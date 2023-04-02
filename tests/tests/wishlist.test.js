const request = require("supertest");

const { createApp } = require("../../app");
const dataSource = require("../../api/models/dataSource");
const testClient = require("../test-client");
const { usersFixture, itemsFixture, } = require("../fixtures");
const wishlistFixture = require("../fixtures/wishlist-fixture");

describe("Add To Wishlist", () => {
  let app;

  const tables = [
    "users",
    "items",
    "categories",
    "materials",
    "items_materials",
    "wishlist",
  ];

  const user1 = {
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

  const user2 = {
    id: 2,
    email: "youngsup94@naver.com",
    name: "이영섭",
    password: "youngsup94",
    providerId: "1658203819",
    bankName: "하나",
    bankAccount: "107-654-513362",
    artistRegistration: "IGA-182",
    bidAgreement: true,
  };

  const user3 = {
    id: 3,
    email: "ssfvxv21@naver.com",
    name: "왈왈왈",
    password: "walwalwal21",
    providerId: "4959390193",
    bankName: "농협",
    bankAccount: "101-692-418329",
    artistRegistration: "IGA-391",
    bidAgreement: true,
  };

  const user4 = {
    id: 4,
    email: "krpqqom52@naver.com",
    name: "잠잠잠",
    password: "jamjamjam52",
    providerId: "9782830172",
    bankName: "씨티",
    bankAccount: "105-425-682381",
    artistRegistration: "IGA-137",
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

  const item1 = {
    id: 1,
    sellerId: user1.id,
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

  const item2 = {
    id: 2,
    sellerId: user2.id,
    categoryId: category.id,
    authorName: "이승희",
    itemName: "크레센트",
    productionYear: 2017,
    width: 4.3,
    length: 3.2,
    height: 3.7,
    weight: 0.02,
    adminNumber: "EGSW581256",
    description:
      "초승달은 서서히 차올라 보름달을 향해 나아간다. 꼭 우리의 삶처럼.",
    startingBid: 2450000.0,
    imageUrl: "https://wevre.s3.ap-northeast-2.amazonaws.com/Items/2.avif",
    biddingStart: "2023-03-28 00:00:00",
    biddingEnd: "2023-04-04 00:00:00",
  };

  const item3 = {
    id: 3,
    sellerId: user3.id,
    categoryId: category.id,
    authorName: "주시아",
    itemName: "경청",
    productionYear: 2014,
    width: 2.5,
    length: 3.8,
    height: 2.4,
    weight: 0.009,
    adminNumber: "PWCD825614",
    description:
      "당신에게 영원의 사랑을 맹세하는 순간은 당신의 마음을 평생 듣겠다는 뜻입니다.",
    startingBid: 1952000.0,
    imageUrl: "https://wevre.s3.ap-northeast-2.amazonaws.com/Items/3.avif",
    biddingStart: "2023-03-28 00:00:00",
    biddingEnd: "2023-04-04 00:00:00",
  };

  const itemMaterial1 = {
    id: 1,
    itemId: item1.id,
    materialId: material.id,
  };

  const itemMaterial2 = {
    id: 2,
    itemId: item2.id,
    materialId: material.id,
  };

  const itemMaterial3 = {
    id: 3,
    itemId: item3.id,
    materialId: material.id,
  };

  const wishlist1 = {
    id: 1,
    userId: user4.id,
    itemId: item1.id,
  };

  const wishlist2 = {
    id: 2,
    userId: user4.id,
    itemId: item2.id,
  };

  const wishlist3 = {
    id: 3,
    userId: user4.id,
    itemId: item3.id,
  };

  beforeAll(async () => {
    app = createApp();
    await dataSource.initialize();
    await usersFixture.createUsers([user1, user2, user3, user4]);
    await itemsFixture.createMaterials([material]);
    await itemsFixture.createCategories([category]);
    await itemsFixture.createItems([item1, item2, item3]);
    await itemsFixture.createItemsMaterials([
      itemMaterial1,
      itemMaterial2,
      itemMaterial3,
    ]);
    await wishlistFixture.createWishlist([wishlist1, wishlist2, wishlist3]);
  }, 15000);

  afterAll(async () => {
    await testClient.truncateTables(tables);
    await dataSource.destroy();
  }, 15000);

  test("SUCCESS: item added to wishlist", async () => {
    const response = await request(app).post("/wishlist/items/1");

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({ data: 1 });
  });

  test("SUCCESS: item added to wishlist", async () => {
    const response = await request(app).get("/wishlist/");

    console.log(typeof response.body.data.length);

    expect(response.status).toEqual(200);
    expect(response.body.data).toHaveLength(3);
  });

  test("FAIL: not found", async () => {
    const response = await request(app).post("/wishlist/items/");

    expect(response.status).toEqual(404);
  });
});
