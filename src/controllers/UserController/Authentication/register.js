const User = require("../../../models/Users");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmail = require("../../../utils/sendEmailVerification");

const Register = async (req, res) => {
  try {
    await User.sync();

    const { organizationName, email, password, userType } = req.body;
    const details = ["organizationName", "userType", "email", "password"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }
    const duplicateUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (duplicateUser) {
      // if the emailis not verify, update the user account
      if (!duplicateUser.isVerify) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        // Update user information using the instance method 'update'
        const updateUser = await duplicateUser.update({
          organizationName,
          password: hashedPassword,
          role: userType,
          verificationToken,
        });

        // Send verification email
        await sendVerificationEmail({
          username: updateUser.organizationName,
          email: updateUser.email,
          verificationToken: updateUser.verificationToken,
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
      // If the user doesn't exist, create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newUser = await User.create({
        organizationName,
        email,
        password: hashedPassword,
        verificationToken,
        role: userType,
        isVerified: false,
      });

      await sendVerificationEmail({
        organizationName: newUser.organizationName,
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

const onBoarding = async (req, res) => {
  try {
    const { userId, numberOfTargetAudience, categoryInterest } = req.body;
    const details = ["userId", "numberOfTargetAudience", "categoryInterest"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }
    if (
      !categoryInterest &&
      !Array.isArray(categoryInterest) &&
      categoryInterest.length === 0
    ) {
      return res.status(400).json({
        message: "Please choose from the selected fields selected field.",
      });
    }

    const interestStringified = JSON.stringify(categoryInterest);
    const [updatedRows] = await User.update(
      {
        numberOfTargetAudience,
        categoryInterest: interestStringified,
      },
      {
        where: { id: userId },
      }
    );
    if (updatedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findOne({ where: { id: userId } });

    return res.status(200).json({
      message: "Onboarding successful",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error during onboarding:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = { Register, onBoarding };
