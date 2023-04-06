const dataSource = require("./dataSource");

const getUser = async (userId) => {
    return await dataSource.query(`
      SELECT id,
             email,
             name,
             CONCAT(bank_name, "은행")        AS bankName,
             bank_account                   AS bankAccount,
             artist_registration            AS artistRegistration,
             IF(bid_agreement, "동의", "비동의") AS bidAgreement,
             CONCAT(YEAR(created_at), "년 ", MONTH(created_at), "월 ", DAY(created_at), "일 ",
                    HOUR(created_at), "시 ", MINUTE(created_at), "분 ", SECOND(created_at),
                    "초")                    AS createdAt
      FROM users
      WHERE id = ?`, [userId])
}

const registerBuyer = async (userId) => {
    console.log("222")
    await dataSource.query(`
      UPDATE users
      SET bid_agreement = 1
      WHERE id = ?`, [userId])
      console.log("3333")
}

const registerSeller = async (userId, bankName, bankAccount, artistRegistration) => {
    await dataSource.query(`
      UPDATE users
      SET bank_name           = ?,
          bank_account        = ?,
          artist_registration = ?
      WHERE id = ?`, [bankName, bankAccount, artistRegistration, userId])
}

const checkRegistered = async (kakaoId) => {
    const [res] = await dataSource.query(`
      SELECT EXISTS(
                     SELECT id FROM users WHERE provider_id = ?) AS registered`, [kakaoId])
    return !!parseInt(res["registered"])
}

const createKakaoUser = async (kakaoId, email, nickname) => {
    const user = await dataSource.query(`INSERT INTO users(email, name, provider_id)
                          VALUES (?, ?, ?)`, [email, nickname, kakaoId]);

    return user.insertId;
}

const getUserBySocialId = async (kakaoId) => {
    return await dataSource.query(
      `SELECT id as userId
     FROM users
     WHERE provider_id = ?`, [kakaoId]
    )
}

module.exports = {
    getUser,
    registerBuyer,
    registerSeller,
    checkRegistered,
    createKakaoUser,
    getUserBySocialId,
};
