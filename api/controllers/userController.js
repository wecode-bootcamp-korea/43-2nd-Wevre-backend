const { userService } = require("../services");
const { catchAsync } = require("../utils/error");

const kakaoSignIn = catchAsync(async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(200).json({ message: "KEY_ERROR" });
  }

  const result = await userService.login(code);

  return res.status(200).json({ result });
});

const getUser = catchAsync(async (req, res) => {
  const userId = req.user;
  const user = await userService.getUser(userId);

  return res.status(200).json({ user });
});

const registerBuyer = catchAsync(async (req, res) => {
  const userId = req.user;
  await userService.registerBuyer(userId);

  return res.status(201).json({ message: "SUCCESSFULLY_REGISTERED" });
});

const registerSeller = catchAsync(async (req, res) => {
  const userId = req.user;
  const { bankName, bankAccount, artistRegistration } = req.body;

  await userService.registerSeller(
    userId,
    bankName,
    bankAccount,
    artistRegistration
  );

  return res.status(201).json({ message: "SUCCESSFULLY_REGISTERED" });
});

module.exports = {
  kakaoSignIn,
  getUser,
  registerBuyer,
  registerSeller,
};
