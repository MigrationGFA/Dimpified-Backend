const EcosystemUser = require("../../../models/EcosystemUser");
const bcrypt = require("bcryptjs");
const Token = require("../../../models/Token");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");


const loginUser = async (req, res) => {
  try {
    await Token.sync();
    const { email, password, domainName } = req.body;

    const details = ["password", "email", "domainName"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const enduser = await EcosystemUser.findOne({ where: { email: email, ecosystemDomain: domainName  } });
    if (!enduser) {
      return res.status(404).json({ message: "Invalid email credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, enduser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password credential" });
    }

    if (!enduser.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please check your email to verify your account" });
    }

    const userTokens = await Token.findOne({ where: { userId: enduser.id } });
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
      accessToken = generateAccessToken(enduser.id, enduser.role);
      refreshToken = generateRefreshToken(enduser.id, enduser.role);
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ); // 15 days from now

      await Token.create({
        accessToken,
        refreshToken,
        userId: enduser.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
        type: "Ecosystem-User"
      });
    }


    const userSubset = {
      UserId: enduser.id,
      username: enduser.username,
      email: enduser.email,
      role: enduser.role,
      image: enduser.imageUrl,
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: userSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = loginUser;
