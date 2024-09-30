const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Creator = require("../../../models/Creator");
const sendVerificationOTPCreator = require("../../../utils/sendVerificationOTPCreator");
const sendWelcomeEmailCreator = require("../../../utils/creatorWelcome");

const creatorSignup = async (req, res) => {
  try {
    await Creator.sync();

    const {
      firstName,
      surName,
      otherName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      password,
      confirmPassword,
      role,
    } = req.body;
    const details = ["email", "password", "role"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const duplicateCreator = await Creator.findOne({
      where: {
        email: email,
      },
    });

    if (duplicateCreator) {
      // If the email is not verified, update the creator account
      if (!duplicateCreator.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const generateOTP = () => {
          return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
        };

        const OTP = generateOTP();


        // Update creator information using the instance method 'update'
        const updateCreator = await duplicateCreator.update({
          organizationName: firstName,
          password: hashedPassword,
          verificationToken: OTP,
          role,
        });

        // Send verification email
        await sendVerificationOTPCreator({
          organizationName: firstName,
          email: email,
          verificationToken: OTP,
          origin: process.env.ORIGIN,
        });

        return res
          .status(201)
          .json({ message: "Verification email resent successfully" });
      } else {
        return res
          .status(409)
          .json({ message: "Email address is associated with an account" });
      }
    } else {
      // If the creator doesn't exist, create a new creator
      const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000);
      };
      const OTP = generateOTP();
      const hashedPassword = await bcrypt.hash(password, 10);

      let affiliateId;
      if (refCode === "not available") {
        affiliateId = null;
      } else {
        affiliateId = refCode;
      }

      const newCreator = await Creator.create({
        organizationName: firstName,
        email,
        affiliateId,
        password: hashedPassword,
        verificationToken: OTP,
        isVerified: false,
        role,
      });
      console.log("creator:", newCreator);
      await sendVerificationOTPCreator({
        organizationName: firstName,
        email: email,
        verificationToken: verificationToken,
        origin: process.env.ORIGIN,
      });

      return res.status(201).json({ message: "Creator created successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const verifyOTPCreator = async (req, res) => {
  const { email, OTP } = req.body;

  if (!email || !OTP) {
    return res
      .status(400)
      .json({ msg: "Email and OTP are required" });
  }

  try {
    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res.status(404).json({ msg: "Creator not found" });
    }
console.log("creator:",creator)
    if (creator.isVerified) {
      return res.status(200).json({ msg: "Email has already been verified" });
    }

    if (creator.verificationToken !== OTP) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    creator.isVerified = true;
    creator.verificationToken = "";
    await creator.save();

    await sendWelcomeEmailCreator({
      organizationName: creator.organizationName,
      email: email,
    });

    return res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = { creatorSignup, verifyOTPCreator };
