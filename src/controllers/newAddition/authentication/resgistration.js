const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Creator = require("../../../models/Creator");
const sendVerificationOTPCreator = require("../../../utils/sendVerificationOTPCreator");
const sendWelcomeEmailCreator = require("../../../utils/creatorWelcome");
const CreatorProfile = require("../../../models/CreatorProfile");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../../utils/generateToken");

const Ecosystem = require("../../../models/Ecosystem");
const sendForgotPasswordEmail = require("../../../utils/sendForgottenPassword");
const sendResetPasswordAlert = require("../../../utils/sendPasswordAlert");
const sendForgotPasswordOTP = require("../../../utils/sendPasswordResetOTP");

const creatorSignup = async (req, res) => {
  try {
    await Creator.sync();
    console.log("body:", req.body);

    const {
      fullName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      password,
      role,
      refCode,
      organizationName,
    } = req.body;

    const requiredFields = [
      "fullName",
      "email",
      "password",
      "role",
      "phoneNumber",
      "dateOfBirth",
      "organizationName",
      "gender",
      "refCode",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const duplicateCreator = await Creator.findOne({
      where: { email: email },
    });

    let creatorName = fullName;
    if (duplicateCreator) {
      const getProfile = await CreatorProfile.findOne({
        creatorId: duplicateCreator.id,
      });
      if (getProfile) {
        creatorName = getProfile.fullName;
      }
    }

    if (duplicateCreator) {
      // If the email is not verified, update the creator account
      if (!duplicateCreator.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const OTP = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP

        // Update creator information
        await duplicateCreator.update({
          organizationName,
          password: hashedPassword,
          verificationToken: OTP,
          role,
        });

        // Send verification email
        await sendVerificationOTPCreator({
          organizationName: fullName, // This might be better as creator.organizationName
          email: email,
          verificationToken: OTP,
          origin: process.env.ORIGIN,
        });
        const accessToken = generateAccessToken(
          duplicateCreator.id,
          duplicateCreator.role
        );
        const refreshToken = generateRefreshToken(
          duplicateCreator.id,
          duplicateCreator.role
        );

        const getProfile = await CreatorProfile.findOne({
          creatorId: duplicateCreator.id,
        });
        if (getProfile) {
          creatorName = getProfile.fullName;
        }

        const user = {
          creatorId: duplicateCreator.id,
          fullName: creatorName,
          email: duplicateCreator.email,
          affiliateId: duplicateCreator.affiliateId,
          role: duplicateCreator.role,
          profile: true,
          step: duplicateCreator.step,
        };

        return res.status(201).json({
          message: "Verification email resent successfully",
          accessToken,
          refreshToken,
          user,
        });
      } else {
        const accessToken = generateAccessToken(
          duplicateCreator.id,
          duplicateCreator.role
        );
        const refreshToken = generateRefreshToken(
          duplicateCreator.id,
          duplicateCreator.role
        );

        const user = {
          creatorId: duplicateCreator.id,
          fullName: creatorName,
          email: duplicateCreator.email,
          affiliateId: duplicateCreator.affiliateId,
          role: duplicateCreator.role,
          profile: true,
          step: duplicateCreator.step,
        };
        return res.status(200).json({
          message: "Email address is associated with an account",
          accessToken,
          refreshToken,
          user,
        });
      }
    } else {
      // If the creator doesn't exist, create a new creator
      const OTP = Math.floor(100000 + Math.random() * 900000);
      const hashedPassword = await bcrypt.hash(password, 10);

      const affiliateId = refCode === "not available" ? null : refCode;
      const creatorBody = {
        organizationName,
        email,
        affiliateId,
        password: hashedPassword,
        verificationToken: OTP,
        isVerified: false,
        role,
        step: 1,
      };
      console.log("creatorBody:", creatorBody);
      const newCreator = await Creator.create(creatorBody);

      // Create a CreatorProfile without organizationName
      const newCreatorProfile = new CreatorProfile({
        fullName,
        email,
        organizationName,
        phoneNumber,
        gender,
        dateOfBirth: new Date(dateOfBirth), // Ensure date is correctly formatted
        creatorId: newCreator.id, // Ensure this is a Number
      });

      await newCreatorProfile.save();

      // Send verification email
      await sendVerificationOTPCreator({
        organizationName: fullName, // This might be better as creator.organizationName
        email: email,
        verificationToken: OTP,
        origin: process.env.ORIGIN,
      });

      const accessToken = generateAccessToken(newCreator.id, newCreator.role);
      const refreshToken = generateRefreshToken(newCreator.id, newCreator.role);

      const user = {
        creatorId: newCreator.id,
        fullName: newCreatorProfile.fullName,
        email: newCreator.email,
        affiliateId: newCreator.affiliateId,
        role: newCreator.role,
        profile: true,
        step: newCreator.step,
      };

      return res.status(201).json({
        message: "Creator created successfully",
        accessToken,
        refreshToken,
        user,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

const verifyOTPCreator = async (req, res) => {
  const { email, OTP } = req.body;

  if (!email || !OTP) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    if (creator.verificationToken !== OTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    creator.isVerified = true;
    creator.verificationToken = "";
    creator.step = 2;
    await creator.save();

    const creatorProfile = await CreatorProfile.findOne({
      creatorId: creator.id,
    });

    await sendWelcomeEmailCreator({
      organizationName: creatorProfile.fullName,
      email: email,
    });

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const getCreators = async (req, res) => {
  try {
    const creators = await Creator.findAll({
      order: [["createdAt", "DESC"]], // Sorting by `createdAt` in descending order
    });

    res.status(200).json({ creators });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const createBusinessDetails = async (req, res) => {
  const {
    creatorId,
    ecosystemName,
    ecosystemDomain,
    targetAudienceSector,
    mainObjective,
    contact,
    address,
    ecosystemDescription,
    country,
    state,
    localGovernment,
  } = req.body;

  const requiredFields = [
    "creatorId",
    "ecosystemName",
    "ecosystemDomain",
    "targetAudienceSector",
    "mainObjective",
    "contact",
    "address",
    "ecosystemDescription",
    "country",
    "state",
    "localGovernment",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  try {
    let creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    creator.step = 3;
    creator.organizationName = ecosystemName;

    let ecosystem;
    ecosystem = new Ecosystem({
      creatorId,
      ecosystemName,
      ecosystemDomain,
      contact,
      mainObjective,
      steps: 1,
      targetAudienceSector,
      address,
      ecosystemDescription,
      country,
      state,
      localGovernment,
      status: "draft",
    });
    await ecosystem.save();
    await creator.save();
    return res
      .status(201)
      .json({ message: "Ecosystem about information saved", ecosystem });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const email = req.body.email;

  try {
    const creator = await Creator.findOne({ where: { email } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    console.log("creator:", creator);

    const OTP = Math.floor(100000 + Math.random() * 900000);

    creator.passwordToken = OTP;

    await creator.save();

    const creatorProfile = await CreatorProfile.findOne({
      email,
    });
    if (!creatorProfile) {
      return res.status(404).json({ message: "CreatorProfile not found" });
    }
    console.log("creator:", creator);

    sendForgotPasswordOTP({
      username: creatorProfile.fullName,
      email,
      OTP,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "Password reset email sent succesfully" });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const resendPasswordResetOTP = async (req, res) => {
  const email = req.body.email;

  try {
    const creator = await Creator.findOne({ where: { email } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    console.log("creator:", creator);

    const OTP = Math.floor(100000 + Math.random() * 900000);

    creator.passwordToken = OTP;
    creator.passwordTokenExpirationDate = null;

    await creator.save();

    const creatorProfile = await CreatorProfile.findOne({
      email,
    });
    if (!creatorProfile) {
      return res.status(404).json({ message: "CreatorProfile not found" });
    }
    console.log("creator:", creator);

    sendForgotPasswordOTP({
      username: creatorProfile.fullName,
      email,
      OTP,
      origin: process.env.ORIGIN,
    });

    res
      .status(200)
      .json({ message: "Password reset email resent succesfully" });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const verifyResetPasswordOtp = async (req, res) => {
  const { email, OTP } = req.body;

  const requiredFields = ["email", "OTP"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  try {
    const creator = await Creator.findOne({ where: { email } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    if (creator.passwordToken !== OTP) {
      return res.status(400).json({ message: "Invalid password token" });
    }

    creator.passwordToken = "";

    const resetTokenExpirationTime = 5 * 60 * 1000; // 30 minutes in milliseconds
    const expirationDate = Date.now() + resetTokenExpirationTime;

    creator.passwordTokenExpirationDate = expirationDate;

    await creator.save();
    console.log("creator:", creator);

    res.status(200).json({ message: "OTP successfully verified" });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  const requiredFields = ["email", "password"];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  try {
    const creator = await Creator.findOne({ where: { email } });
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    if (creator.passwordTokenExpirationDate < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    creator.password = hashedPassword;
    creator.passwordTokenExpirationDate = null;

    await creator.save();
    const creatorProfile = await CreatorProfile.findOne({
      creatorId: creator.id,
    });
    console.log("creator:", creator);

    await sendResetPasswordAlert({
      username: creatorProfile.fullName,
      email,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "Password reset succesfully" });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const resendOTPCreator = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res
        .status(404)
        .json({ msg: "No account is associated with this email address" });
    }

    if (creator.isVerified) {
      return res.status(400).json({ msg: "Email address has been verified" });
    }

    const newVerificationToken = crypto.randomBytes(40).toString("hex");
    creator.verificationToken = newVerificationToken;

    await creator.save();

    const origin = process.env.ORIGIN;

    const creatorProfile = await CreatorProfile.findOne({
      creatorId: creator.id,
    });

    await sendVerificationOTPCreator({
      organizationName: creatorProfile.fullName,
      email: email,
      verificationToken: OTP,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "New verification email sent" });
  } catch (error) {
    console.error("Error during resending email:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

module.exports = {
  creatorSignup,
  verifyOTPCreator,
  getCreators,
  resendOTPCreator,
  createBusinessDetails,
  forgotPassword,
  resetPassword,
  verifyResetPasswordOtp,
  resendPasswordResetOTP,
};
