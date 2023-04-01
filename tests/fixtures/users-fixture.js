const dataSource = require("../../api/models/dataSource");

const createUsers = async (userList) => {
  let data = [];

  for (const user of userList) {
    data.push([
      user.id,
      user.email,
      user.name,
      user.password,
      user.providerId,
      user.bankName,
      user.bankAccount,
      user.artistRegistration,
      user.bidAgreement,
    ]);
  }

  return await dataSource.query(
    `
    INSERT INTO users (
      id,
      email,
      name,
      password,
      provider_id,
      bank_name,
      bank_account,
      artist_registration,
      bid_agreement
    ) VALUES ?
  `,
    [data]
  );
};

module.exports = { createUsers };
