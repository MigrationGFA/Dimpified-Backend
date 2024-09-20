const Token = require("../models/CreatorToken");
const Creator = require("../models/Creator");

const {
  isAccessTokenValid,
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
    const existingToken = await Token.findOne({
      where: { 
        userId: payload.id,
        refreshToken: creatorToken
      },
      include: [{ model: Creator }],
    });

    if (!existingToken || !existingToken.Creator) {
      return res
        .status(401)
        .json({ msg: "Invalid refresh token. Please login again." });
    }

    
    const newAccessToken = generateAccessToken(
      existingToken.Creator.id,
      existingToken.Creator.username,
      existingToken.Creator.email,
      existingToken.Creator.role
    );

     existingToken.accessToken = newAccessToken;
     await existingToken.save()
    return res.status(200).json({
      msg: "Token refreshed successfully",
      accessToken: newAccessToken,
      creatorToken,
    });
  } catch (error) {
    console.error("Error during refresh token validation:", error);
    return res
      .status(401)
      .json({ msg: "Invalid refresh token. Please login again." });
  }
};

module.exports = refreshCreatorToken;
