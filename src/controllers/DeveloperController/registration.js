const Developer = require("../../models/Developer");
const bcrypt = require("bcryptjs");
const Token = require("../../models/Token");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

const developerSignup = async (req, res) => {
  await Developer.sync();
  try {
    const { fullName, email, country, phoneNumber, password } = req.body;
    const details = ["fullName", "country", "email", "phoneNumber", "password"];

    // Check for required details
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const emailExists = await Developer.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const developer = await Developer.create({
      fullName,
      email,
      country,
      phoneNumber,
      password: hashedPassword,
    });

    await developer.save();
    res.status(200).json({ message: "Registration succesfull" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

// const developerLogin = async (req, res) => {
//   try {
//     await Token.sync();
//     const { email, password } = req.body;

//     const details = ["password", "email"];
//     for (const detail of details) {
//       if (!req.body[detail]) {
//         return res.status(400).json({ message: `${detail} is required` });
//       }
//     }

//     const developer = await Developer.findOne({ where: { email: email } });
//     if (!developer) {
//       return res.status(404).json({ message: "Invalid email or password" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, developer.password);
//     if (!isPasswordValid) {
//       return res.status(404).json({ message: "Invalid email or password " });
//     }

//     const userTokens = await Token.findOne({ where: { userId: developer.id } });
//     const currentDate = new Date();
//     const userAgent = req.headers["user-agent"];

//     let accessToken, refreshToken;

//     if (
//       userTokens &&
//       userTokens.accessTokenExpiration > currentDate &&
//       userTokens.refreshTokenExpiration > currentDate
//     ) {
//       accessToken = userTokens.accessToken;
//       refreshToken = userTokens.refreshToken;
//       await userTokens.update({ userAgent });
//     } else {
//       accessToken = generateAccessToken(developer.id, "developer");
//       refreshToken = generateRefreshToken(developer.id, "developer");
//       const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
//       const refreshTokenExpiration = new Date(
//         Date.now() + 15 * 24 * 60 * 60 * 1000
//       ); // 15 days from now

//       await Token.create({
//         accessToken,
//         refreshToken,
//         userId: developer.id,
//         userAgent,
//         accessTokenExpiration,
//         refreshTokenExpiration,
//       });
//     }

//     return res.status(200).json({
//       message: "Login successful",
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

module.exports = { developerSignup, developerLogin };
