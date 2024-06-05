const Creator = require("../../../models/Creator");
const CreatorProfile = require("../../../models/CreatorProfile");
const bcrypt = require("bcryptjs");
const CreatorToken = require("../../../models/CreatorToken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");

// const LoginCreator = async (req, res) => {
//   try {
//     await CreatorToken.sync();
//     const { email, password } = req.body;
//     const details = ["password", "email"];

//     for (const detail of details) {
//       if (!req.body[detail]) {
//         return res.status(400).json({ message: `${detail} is required` });
//       }
//     }

//     const creator = await Creator.findOne({
//       where: {
//         email: email,
//       },
//     });

//     if (!creator) {
//       return res.status(404).json({ message: "Invalid email Credential" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, creator.password);
//     if (!isPasswordValid) {
//       return res.status(404).json({ message: "Invalid password Credential" });
//     }

//     // to check if the creator has been verified
//     if (!creator.isVerified) {
//       return res
//         .status(401)
//         .json({ msg: "Please check your email to verify your account" });
//     }

//     // to check for token
//     const creatorTokens = await CreatorToken.findOne({
//       where: {
//         userId: creator.id,
//       },
//     });

//     const currentDate = new Date();
//     const userAgent = req.headers["user-agent"];
//     let accessToken, refreshToken;

//     if (
//       creatorTokens &&
//       creatorTokens.accessTokenExpiration > currentDate &&
//       creatorTokens.refreshTokenExpiration > currentDate
//     ) {
//       // Tokens exist and are valid, use them
//       accessToken = creatorTokens.accessToken;
//       refreshToken = creatorTokens.refreshToken;
//       await creatorTokens.update({
//         userAgent: userAgent,
//       });
//     } else {
//       // Tokens don't exist or are invalid, generate new tokens
//       accessToken = generateAccessToken(creator.id, creator.role);
//       refreshToken = generateRefreshToken(creator.id, creator.role);

//       const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
//       const refreshTokenExpiration = new Date(
//         Date.now() + 15 * 24 * 60 * 60 * 1000
//       ); // 15 days from now

//       // Save the new tokens to the database
//       await CreatorToken.create({
//         accessToken: accessToken,
//         refreshToken: refreshToken,
//         userId: creator.id,
//         userAgent: userAgent,
//         accessTokenExpiration: accessTokenExpiration,
//         refreshTokenExpiration: refreshTokenExpiration,
//       });
//     }

//     const creatorSubset = {
//       CreatorId: creator.id,
//       organizationName: creator.organizationName,
//       email: creator.email,
//       role: creator.role,
//       image: creator.imageUrl,
//       // Add other properties you want to include
//     };

//     return res.status(200).json({
//       message: "Login successful",
//       accessToken: accessToken,
//       refreshToken: refreshToken,
//       data: creatorSubset,
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

const LoginCreator = async (req, res) => {
  try {
    await CreatorProfile.sync();
    await CreatorToken.sync();
    const { email, password } = req.body;
    const details = ["password", "email"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const creator = await Creator.findOne({
      where: {
        email: email,
      },
    });

    if (!creator) {
      return res.status(404).json({ message: "Invalid email Credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, creator.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid password Credential" });
    }

    // to check if the creator has been verified
    if (!creator.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please check your email to verify your account" });
    }

    // to check for token
    const creatorTokens = await CreatorToken.findOne({
      where: {
        userId: creator.id,
      },
    });

    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];
    let accessToken, refreshToken;

    if (
      creatorTokens &&
      creatorTokens.accessTokenExpiration > currentDate &&
      creatorTokens.refreshTokenExpiration > currentDate
    ) {
      // Tokens exist and are valid, use them
      accessToken = creatorTokens.accessToken;
      refreshToken = creatorTokens.refreshToken;
      await creatorTokens.update({
        userAgent: userAgent,
      });
    } else {
      // Tokens don't exist or are invalid, generate new tokens
      accessToken = generateAccessToken(creator.id, creator.role);
      refreshToken = generateRefreshToken(creator.id, creator.role);

      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ); // 15 days from now

      // Save the new tokens to the database
      await CreatorToken.create({
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: creator.id,
        userAgent: userAgent,
        accessTokenExpiration: accessTokenExpiration,
        refreshTokenExpiration: refreshTokenExpiration,
      });
    }

    // Check if profile is set
    let setProfile = false;
    const creatorProfile = await CreatorProfile.findOne({
      where: { creatorId: creator.id },
    });
    setProfile = !!creatorProfile;

    const creatorSubset = {
      CreatorId: creator.id,
      organizationName: creator.organizationName,
      email: creator.email,
      role: creator.role,
      image: creator.imageUrl,
      profile: setProfile,
      // Add other properties you want to include
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
      data: creatorSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = LoginCreator;
