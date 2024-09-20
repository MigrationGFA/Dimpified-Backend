const Token = require("../models/CreatorToken");

const {
  isAccessTokenValid,
} = require("../utils/generateToken");

const authenticateToken = async (req, res, next) => {

    try {
    const accessToken = req.headers.authorization?.split("Bearer ")[1]?.trim();
    
    if (!accessToken) {
      return res.status(401).json({
        msg: "Please login again to continue your process there is no access token",
      });
    }
const payload = await isAccessTokenValid(accessToken);
      req.user = payload;
      req.userId = payload.id;
      return next();
 } catch (error) {
         console.error("Error during authentication:", error);
    res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = authenticateToken