const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const bcrypt = require("bcryptjs");
const Token = require("../../../models/Token");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");

const Login = async (req, res) => {
  try {
    await Token.sync();
    const { email, password, userType } = req.body;

    // Validate input
    if (!email || !password || !userType) {
      return res
        .status(400)
        .json({ message: "Email, password, and user type are required" });
    }

    // Determine the model based on userType
    let UserModel;
    if (userType === "admin") {
      UserModel = Admin;
    } else if (userType === "user") {
      UserModel = EndUser;
    } else if (userType === "creator") {
      UserModel = Creator;
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Find user by email in the specified model
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    // Check if the user's account is verified
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your account via email" });
    }

    // Check for existing tokens
    const userTokens = await Token.findOne({ where: { userId: user.id } });
    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];
    const hasInterests = user.categoryInterest ? "yes" : "no";

    let accessToken, refreshToken;

    if (
      userTokens &&
      userTokens.accessTokenExpiration > currentDate &&
      userTokens.refreshTokenExpiration > currentDate
    ) {
      // Tokens exist and are valid, use them
      accessToken = userTokens.accessToken;
      refreshToken = userTokens.refreshToken;
      await userTokens.update({ userAgent });
    } else {
      // Generate new tokens
      accessToken = generateAccessToken(user.id, user.role);
      refreshToken = generateRefreshToken(user.id, user.role);

      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ); // 15 days

      // Save new tokens
      await Token.create({
        accessToken,
        refreshToken,
        userId: user.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
      });
    }

    const userSubset = {
      userId: user.id,
      organizationName: user.organizationName,
      email: user.email,
      role: user.role,
      image: user.imageUrl,
      interest: hasInterests,
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: userSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = Login;
