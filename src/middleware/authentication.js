const Token = require("../models/Token");

const {
  isAccessTokenValid,
  isRefreshTokenValid,
  generateAccessToken,
} = require("../utils/generateToken");

const authenticatedUser = async (req, res, next) => {
  console.log("header type", req.headers);
  const accessToken = req.headers.authorization?.split("Bearer ")[1]?.trim();
  const refreshToken = req.headers["refresh-token"];

  console.log("this is refresh token", refreshToken);
  console.log("this is access token", accessToken);

  try {
    if (!accessToken || !refreshToken) {
      return res.status(401).json({
        message: "Please login again to continue your process",
      });
    }
    if (accessToken) {
      const payload = await isAccessTokenValid(accessToken);
      req.user = payload;
      req.userId = payload.id;
      console.log("Access Token Payload:", payload);
      return next();
    }

    const payload = await isRefreshTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.id,
    });
    console.log("Refresh Token Payload:", payload);
    console.log("existing Payload:", existingToken);

    if (!existingToken || !existingToken.isValid) {
      return res.status(401).json({
        msg: "Please login again to continue your process",
      });
    }

    const oneDay = 1000 * 60 * 24;
    const newAccessToken = generateAccessToken(
      existingToken.user._id,
      existingToken.user.username,
      existingToken.user.email,
      existingToken.user.role
    );

    res.status(200).json({
      msg: "User login successfully",
      accessToken: newAccessToken,
      refreshToken: refreshToken,
      data: userSubset,
    });

    req.user = payload;
    next();
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = authenticatedUser;
