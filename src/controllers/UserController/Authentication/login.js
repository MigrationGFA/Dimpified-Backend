const User = require("../../../models/Users");
const bcrypt = require("bcryptjs");
const Token = require("../../../models/Token");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");

// const Login = async (req, res) => {
//   try {
//     await Token.sync();
//     const { email, password } = req.body;
//     const details = ["password", "email"];

//     for (const detail of details) {
//       if (!req.body[detail]) {
//         return res.status(400).json({ message: `${detail} is required` });
//       }
//     }

//     const user = await User.findOne({
//       where: {
//         email: email,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Invalid email Credential" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(404).json({ message: "Invalid password Credential" });
//     }

//     // Check if the user's account is verified
//     if (!user.isVerified) {
//       return res
//         .status(401)
//         .json({ msg: "Please Check your mail to verify your account" });
//     }

//     // Check for token
//     const userTokens = await Token.findOne({
//       where: {
//         userId: user.id,
//       },
//     });
//     const currentDate = new Date();
//     const userAgent = req.headers["user-agent"];

//     let accessToken, refreshToken;

//     if (
//       userTokens &&
//       userTokens.isAccessTokenValid > currentDate &&
//       userTokens.isRefreshTokenValid > currentDate
//     ) {
//       // Tokens exist and are valid, use them
//       accessToken = userTokens.accessToken;
//       refreshToken = userTokens.refreshToken;
//       await userTokens.update({
//         userAgent: userAgent,
//       });
//     } else {
//       // Tokens don't exist or are invalid, generate new tokens
//       accessToken = generateAccessToken(user.id, user.role);
//       refreshToken = generateRefreshToken(user.id, user.role);

//       const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
//       const refreshTokenExpiration = new Date(
//         Date.now() + 15 * 24 * 60 * 60 * 1000
//       ); // 15 days from now
//       // Save the new tokens to the database
//       await Token.create({
//         accessToken: accessToken,
//         refreshToken: refreshToken,
//         userId: user.id,
//         userAgent: userAgent,
//         accessTokenExpiration: accessTokenExpiration,
//         refreshTokenExpiration: refreshTokenExpiration,
//       });
//     }

//     const userSubset = {
//       UserId: user.id,
//       organizationName: user.organizationName,
//       email: user.email,
//       role: user.role,
//       image: user.imageUrl,
//     };

//     return res.status(200).json({
//       message: "Login successfull",
//       accessToken: accessToken,
//       refreshToken: refreshToken,
//       data: userSubset,
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "internal server error", error });
//   }
// };

const Login = async (req, res) => {
  try {
    await Token.sync();
    const { email, password, organizationName } = req.body;
    const details = ["password"];

    if (!email && !organizationName) {
      return res
        .status(400)
        .json({ message: "Email or organizationName is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    }
    if (!user && organizationName) {
      user = await User.findOne({ where: { organizationName } });
    }

    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    // Check if the user's account is verified
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please check your email to verify your account" });
    }

    // Check for token
    const userTokens = await Token.findOne({ where: { userId: user.id } });
    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];

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
      // Tokens don't exist or are invalid, generate new tokens
      accessToken = generateAccessToken(user.id, user.role);
      refreshToken = generateRefreshToken(user.id, user.role);

      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ); // 15 days from now
      // Save the new tokens to the database
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

module.exports = Login;
