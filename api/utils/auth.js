const jwt = require("jsonwebtoken");
const {catchAsync} = require("./error");

const loginRequired = catchAsync(async (req, res, next) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
        const error = new Error("NEED_ACCESS_TOKEN");
        return res.status(401).json({message: error.message});
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (!decoded.userId) {
        const error = new Error("USER_DOES_NOT_EXIST");
        return res.status(404).json({message: error.message});
    }
    req.user = decoded.userId;
    next();
})

module.exports = {loginRequired};
