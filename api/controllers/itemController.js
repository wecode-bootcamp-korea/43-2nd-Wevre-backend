const { itemService } = require("../services");
const { catchAsync } = require("../utils/error");

const getItemDetailsById = catchAsync(async (req, res) => {
  const itemId = +req.params.itemId;

  if (!itemId) {
    const error = new Error("KEY_ERROR");
    error.statusCode = 400;

    throw error;
  }

  const data = await itemService.getItemDetailsById(itemId);

  return res.status(200).json({ data });
});

module.exports = {
  getItemDetailsById,
};
