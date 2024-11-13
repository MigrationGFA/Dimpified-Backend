const Token = require("../models/CreatorToken");
const Creator = require("../models/Creator");
 
const {
  isRefreshTokenValid,
  generateAccessToken,
} = require("../utils/generateToken");
 
const refreshCreatorToken = async (req, res) => {
  const { creatorToken } = req.body;
 
  if (!creatorToken) {
    return res.status(400).json({ msg: "Refresh token is required" });
  }
 
  try {
    const payload = await isRefreshTokenValid(creatorToken);
    console.log("payload", payload);
 
    const existingToken = await Token.findOne({
      where: { userId: payload.id, refreshToken: creatorToken },
      include: [{ model: Creator }],
    });
 
    if (!existingToken || !existingToken.Creator) {
      return res
        .status(401)
        .json({ msg: "Invalid refresh token. Please login again." });
    }
 
    const newAccessToken = generateAccessToken(
      existingToken.Creator.id,
      existingToken.Creator.organizationName,
      existingToken.Creator.email,
      existingToken.Creator.role
    );
 
    console.log("newAccessToken", newAccessToken);
 
    await existingToken.update({
      accessToken: newAccessToken,
      updatedAt: new Date(),
    });
 
    return res.status(200).json({
      msg: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: creatorToken,
    });
  } catch (error) {
    console.error("Error during refresh token validation:", error);
    return res
      .status(401)
      .json({ msg: "Invalid refresh token. Please login again." });
  }
};
 
module.exports = refreshCreatorToken;