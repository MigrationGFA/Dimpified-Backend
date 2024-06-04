const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationUser = require("../../../utils/sendVerificationUser");

// const registerUser = async (req, res) => {
//   try {
//     await EndUser.sync();
//     const { username, email, password, ecosystemId } = req.body;
//     const details = ["username", "ecosystemId", "email", "password"];

//     for (const detail of details) {
//       if (!req.body[detail]) {
//         return res.status(400).json({ msg: `${detail} is required` });
//       }
//     }

//     const duplicateUser = await EndUser.findOne({ where: { email: email } });
//     if (duplicateUser) {
//       if (!duplicateUser.isVerified) {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const verificationToken = crypto.randomBytes(40).toString("hex");

//         await duplicateUser.update({
//           username,
//           password: hashedPassword,
//           ecosystemId,
//           verificationToken,
//         });

//         await sendVerificationUser({
//           username: duplicateUser.username,
//           email: duplicateUser.email,
//           verificationToken: duplicateUser.verificationToken,
//           origin: process.env.ORIGIN,
//         });

//         return res
//           .status(201)
//           .json({ message: "Verification email resent successfully" });
//       } else {
//         return res
//           .status(409)
//           .json({ message: "Email address is associated with an account" });
//       }
//     } else {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const verificationToken = crypto.randomBytes(40).toString("hex");

//       const newUser = await EndUser.create({
//         username,
//         email,
//         password: hashedPassword,
//         verificationToken,
//         ecosystemId,
//         isVerified: false,
//       });

//       await sendVerificationUser({
//         username: newUser.username,
//         email: newUser.email,
//         verificationToken: newUser.verificationToken,
//         origin: process.env.ORIGIN,
//       });

//       return res.status(201).json({ message: "User created successfully" });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Internal Server Error", detail: error });
//   }
// };

const registerUser = async (req, res) => {
  try {
    await EndUser.sync();
    const { username, email, password, ecosystemId } = req.body;
    const details = ["username", "ecosystemId", "email", "password"];

    // Check for required details
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    // Check if the combination of email and ecosystemId is unique
    const duplicateUser = await EndUser.findOne({
      where: { email, ecosystemId },
    });
    if (duplicateUser) {
      if (!duplicateUser.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        await duplicateUser.update({
          username,
          password: hashedPassword,
          verificationToken,
        });

        await sendVerificationUser({
          username: duplicateUser.username,
          email: duplicateUser.email,
          verificationToken: duplicateUser.verificationToken,
          origin: process.env.ORIGIN,
        });

        return res
          .status(201)
          .json({ message: "Verification email resent successfully" });
      } else {
        return res
          .status(409)
          .json({
            message:
              "An account with this email and ecosystemId already exists",
          });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newUser = await EndUser.create({
        username,
        email,
        password: hashedPassword,
        verificationToken,
        ecosystemId,
        isVerified: false,
      });

      await sendVerificationUser({
        username: newUser.username,
        email: newUser.email,
        verificationToken: newUser.verificationToken,
        origin: process.env.ORIGIN,
      });

      return res.status(201).json({ message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = registerUser;
