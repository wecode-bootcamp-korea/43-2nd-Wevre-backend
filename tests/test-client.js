const dataSource = require("../api/models/dataSource");

const truncateTables = async (tableList) => {
  await dataSource.query(`SET FOREIGN_KEY_CHECKS=0`);

  for (const table of tableList) {
    await dataSource.query(`TRUNCATE ${table}`);
    await dataSource.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
  }

  await dataSource.query(`SET FOREIGN_KEY_CHECKS=1`);
};

module.exports = { truncateTables };
const createTestDataSet = async () => {
  const orderStatus = [
    [
      1,
      "결제완료"
    ],
    [     
      2,
      "상품준비"
    ],
    [
      3,
      "배송대기중"
    ],
    [
      4,
      "출고완료"
    ],
    [
      5,
      "배송중"
    ],
    [
      6,
      "배송완료"
    ]
  ];
  
  const shipment = [
    [
      1,
      50000
    ],
    [
      2,
      100000
    ],
    [
      3,
      150000
    ],
    [
      4,
      200000
    ],
    [
      5,
      250000
    ]
  ];

  await dataSource.query(`INSERT INTO order_status (id, name) VALUES ?`, [orderStatus]);
  await dataSource.query(`INSERT INTO shipment (id, fee) VALUES ?`, [shipment]);
}

module.exports = { truncateTables, createTestDataSet };
