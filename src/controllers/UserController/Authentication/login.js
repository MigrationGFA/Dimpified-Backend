const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const EndUserProfile = require("../../../models/UserProfile");
const bcrypt = require("bcryptjs");
const Token = require("../../../models/Token");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");

const loginUser = async (req, res) => {
  try {
    EndUserProfile.sync();
    await Token.sync();
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await EndUser.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Invalid email Credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid password Credential" });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please check your mail to verify your account" });
    }

    const userTokens = await Token.findOne({ where: { userId: user.id } });
    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];
    let accessToken, refreshToken;

    if (
      userTokens &&
      userTokens.accessTokenExpiration > currentDate &&
      userTokens.refreshTokenExpiration > currentDate
    ) {
      accessToken = userTokens.accessToken;
      refreshToken = userTokens.refreshToken;
      await userTokens.update({ userAgent });
    } else {
      accessToken = generateAccessToken(user.id, user.role);
      refreshToken = generateRefreshToken(user.id, user.role);
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000);
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      );

      await Token.create({
        accessToken,
        refreshToken,
        userId: user.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
      });
    }

    // Check if user has completed their profile
    let setProfile = false;
    const userProfile = await EndUserProfile.findOne({
      where: { userId: user.id },
    });
    setProfile = !!userProfile;

    const userSubset = {
      UserId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      image: user.imageUrl,
      profile: setProfile,
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: userSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

module.exports = loginUser;
