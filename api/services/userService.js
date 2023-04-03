const {userDao} = require("../models");
const jwt = require('jsonwebtoken');
const axios = require('axios');

const login = async (code) => {
  const getToken = await axios.post("https://kauth.kakao.com/oauth/token",
    {
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      redirect_uri: "http://localhost:3000/auth/kakao/callback",
      code: code
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

  const accessToken = getToken.data.access_token

  const getKakaoUserData = await axios.get(
    `https://kapi.kakao.com/v2/user/me`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const {id: kakaoId, properties: {nickname}, kakao_account: {email}} = getKakaoUserData.data;

  const isExist = await userDao.checkRegistered(kakaoId);

  let response = {
    accessToken: '',
    statusCode: 0,
  }

  const jwtAccessToken = (Object, statusCode) => {
    response.accessToken = jwt.sign(Object, process.env.JWT_SECRET, {
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRES_IN,
    })
    response.statusCode = statusCode;
    return [response.accessToken, response.statusCode]
  }
  const [userId] = await userDao.getUserBySocialId(kakaoId);

  if (!isExist) {
    await userDao.createKakaoUser(kakaoId, email, nickname)
    jwtAccessToken({userId: kakaoId})
  } else {
    jwtAccessToken({userId: userId.userId})
  }

  return response;
};

const getUser = async (userId) => {
  return await userDao.getUser(userId);
};

const registerBuyer = async (userId) => {
  return await userDao.registerBuyer(userId);
};

const registerSeller = async (userId, bankName, bankAccount, artistRegistration) => {
  return await userDao.registerSeller(userId, bankName, bankAccount, artistRegistration);
};

module.exports = {
  login,
  getUser,
  registerBuyer,
  registerSeller,
};
