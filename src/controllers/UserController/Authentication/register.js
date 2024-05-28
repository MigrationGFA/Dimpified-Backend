const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmail = require("../../../utils/sendEmailVerification");

const Register = async (req, res) => {
  try {
    const {
      email,
      password,
      userType,
      organizationName,
      ecosystemId,
      username,
    } = req.body;

    // Define required details based on userType
    const details =
      userType === "creator"
        ? ["organizationName", "userType", "email", "password"]
        : userType === "user"
        ? ["ecosystemId", "userType", "username", "email", "password"]
        : ["userType", "email", "password"];

    // Validate input
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    let organizationNameForEmail = organizationName;
    // Check if ecosystemId is valid for user type 'user'
    if (userType === "user") {
      const ecosystem = await Creator.findOne({ where: { id: ecosystemId } });
      if (!ecosystem) {
        return res.status(400).json({ message: "Invalid ecosystemId" });
      }
      organizationNameForEmail = ecosystem.organizationName;
      console.log(organizationName);
    }

    // Select appropriate model based on userType
    let UserModel;
    if (userType === "admin") {
      UserModel = Admin; // Use the GfaAdmin model
    } else if (userType === "user") {
      UserModel = EndUser; // Use the EndUser model
    } else if (userType === "creator") {
      UserModel = Creator; // Use the Creator model for creators
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    await UserModel.sync();

    // Check for duplicate user
    const duplicateUser = await UserModel.findOne({ where: { email } });
    if (duplicateUser) {
      if (!duplicateUser.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        const updateUserPayload = {
          password: hashedPassword,
          userType,
          verificationToken,
        };

        if (userType === "creator") {
          updateUserPayload.organizationName = organizationName;
        } else if (userType === "user") {
          updateUserPayload.ecosystemId = ecosystemId;
        }

        const updatedUser = await duplicateUser.update(updateUserPayload);

        // Send verification email
        await sendVerificationEmail({
          organizationName:
            updatedUser.organizationName || updatedUser.username,
          email: updatedUser.email,
          verificationToken: updatedUser.verificationToken,
          ecosystemId: userType === "user" ? ecosystemId : null,
          origin: process.env.ORIGIN,
        });

        return res
          .status(201)
          .json({ message: "Verification email resent successfully" });
      } else {
        return res.status(409).json({
          message: "Email address is associated with an existing account",
        });
      }
    } else {
      // Create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newUserPayload = {
        email,
        username,
        password: hashedPassword,
        verificationToken,
        userType,
        isVerified: false,
      };

      if (userType === "creator") {
        newUserPayload.organizationName = organizationName;
      } else if (userType === "user") {
        newUserPayload.ecosystemId = ecosystemId;
      }

      const newUser = await UserModel.create(newUserPayload);

      // Send verification email
      await sendVerificationEmail({
        organizationName: newUser.organizationName || newUser.username,
        email: newUser.email,
        verificationToken: newUser.verificationToken,
        ecosystemId: userType === "user" ? ecosystemId : null,
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

    const updatedUser = await Creator.findOne({ where: { id: userId } });

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
