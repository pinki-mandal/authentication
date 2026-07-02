const User = require("../modules/user/user.model");
const { verifyAccessToken } = require("../utils/jwt");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = tokenFromHeader || req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token missing" });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password -refreshToken -otpHash");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

module.exports = {
  protect,
};
