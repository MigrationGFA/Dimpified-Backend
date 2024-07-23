const Developer = require("../../models/Developer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");
const sendVerificationEmailDeveloper = require("../../utils/sendVerificationEmailDeveloper");
const DeveloperToken = require("../../models/DeveloperToken");
const sendWelcomeEmailDeveloper = require("../../utils/sendwelcomeEmailDeveloper");
const sendForgotPasswordEmailDeveloper = require("../../utils/sendForgotPasswordDeveloper");
const sendDeveloperResetPasswordAlert = require("../../utils/resetPasswordAlert");

const developerSignup = async (req, res) => {
  try {
    await Developer.sync();

    const { fullName, email, country, phoneNumber, password } = req.body;
    const details = ["fullName", "email", "country", "phoneNumber", "password"];

    // Check for required details
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const emailExists = await Developer.findOne({ where: { email } });
    if (emailExists) {
      // If the email is not verified, update the developer account
      if (!emailExists.verificationToken) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        // Update developer information using the instance method 'update'
        const updatedDeveloper = await emailExists.update({
          fullName,
          country,
          phoneNumber,
          password: hashedPassword,
          verificationToken,
        });

        // Send verification email
        await sendVerificationEmailDeveloper({
          fullName,
          email,
          verificationToken,
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
      // If the developer doesn't exist, create a new developer
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newDeveloper = await Developer.create({
        fullName,
        email,
        country,
        phoneNumber,
        password: hashedPassword,
        verificationToken,
        role: "developer", // default role
      });

      await sendVerificationEmailDeveloper({
        fullName,
        email,
        verificationToken,
        origin: process.env.ORIGIN,
      });

      return res
        .status(201)
        .json({ message: "Developer created successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const developerLogin = async (req, res) => {
  try {
    await DeveloperToken.sync();
    const { email, password } = req.body;

    const details = ["password", "email"];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const developer = await Developer.findOne({ where: { email: email } });
    if (!developer) {
      return res.status(404).json({ message: "Invalid email Credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, developer.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid password Credential" });
    }

    if (!developer.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please check your email to verify your account" });
    }

    const developerTokens = await DeveloperToken.findOne({
      where: { userId: developer.id },
    });
    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];
    const hasInterests =
      developer.categoryInterest && developer.categoryInterest !== null
        ? "yes"
        : "no";

    let accessToken, refreshToken;

    if (
      developerTokens &&
      developerTokens.accessTokenExpiration > currentDate &&
      developerTokens.refreshTokenExpiration > currentDate
    ) {
      accessToken = developerTokens.accessToken;
      refreshToken = developerTokens.refreshToken;
      await developerTokens.update({ userAgent });
    } else {
      accessToken = generateAccessToken(developer.id, developer.role);
      refreshToken = generateRefreshToken(developer.id, developer.role);
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ); // 15 days from now

      await DeveloperToken.create({
        accessToken,
        refreshToken,
        userId: developer.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
      });
    }

    // Assuming setProfile is determined by certain fields being non-null
    let setProfile = developer.fullName && developer.email ? true : false;

    const developerSubset = {
      DeveloperId: developer.id,
      fullName: developer.fullName,
      email: developer.email,
      role: developer.role,
      profile: setProfile,
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: developerSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const verifyEmailDeveloper = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res
      .status(400)
      .json({ msg: "Email and verification token are required" });
  }

  try {
    const developer = await Developer.findOne({ where: { email: email } });

    if (!developer) {
      return res.status(404).json({ msg: "Developer not found" });
    }

    if (developer.isVerified) {
      return res.status(200).json({ msg: "Email has already been verified" });
    }

    if (developer.verificationToken !== verificationToken) {
      return res.status(400).json({ msg: "Invalid verification token" });
    }

    developer.isVerified = true;
    developer.verificationToken = "";
    await developer.save();

    await sendWelcomeEmailDeveloper({
      fullName: developer.fullName,
      email: email,
    });

    return res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const developerLogOut = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const developerToken = await DeveloperToken.findOne({
      where: {
        userId: userId,
      },
    });

    if (!developerToken) {
      return res.status(404).json({ message: "No token found for this user" });
    }

    await developerToken.destroy();
    return res
      .status(200)
      .json({ message: "Developer logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const forgotPasswordDeveloper = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const developer = await Developer.findOne({ where: { email: email } });

    if (!developer) {
      return res.status(404).json({ message: "Developer does not exist" });
    }

    // Check if account has been verified
    if (!developer.isVerified) {
      return res.status(404).json({ message: "Email not verified" });
    }

    const resetToken = crypto.randomBytes(40).toString("hex");
    const resetTokenExpirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const expirationDate = Date.now() + resetTokenExpirationTime;

    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("hashedpassword :", hashedPasswordToken);
    developer.passwordToken = hashedPasswordToken;
    developer.passwordTokenExpirationDate = expirationDate;

    await developer.save();

    console.log("developer.PasswordToken:", developer.passwordToken);
    await sendForgotPasswordEmailDeveloper({
      fullName: developer.fullName,
      email: developer.email,
      token: resetToken,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const resetPasswordDeveloper = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const details = ["resetToken", "newPassword", "email"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const developer = await Developer.findOne({ where: { email: email } });

    if (!developer) {
      return res.status(404).json({ message: "Developer not found" });
    }
    // console.log("hashedPasswordtoken :", hashedPasswordToken);
    // console.log("developer.token :", developer);

    const currentDate = new Date();
    const expireTime = new Date(developer.passwordTokenExpirationDate);

    if (hashedPasswordToken !== developer.passwordToken) {
      return res.status(401).json({ msg: "Incorrect password token" });
    }

    if (expireTime <= currentDate) {
      return res.status(401).json({ message: "Expired reset token" });
    }

    developer.password = await bcrypt.hash(newPassword, 10);
    developer.passwordToken = null;
    developer.passwordTokenExpirationDate = null;

    await developer.save();

    await sendDeveloperResetPasswordAlert({
      fullName: developer.fullName,
      email: email,
      verificationToken: developer.verificationToken,
      origin: process.env.ORIGIN,
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = {
  developerSignup,
  developerLogin,
  verifyEmailDeveloper,
  developerLogOut,
  forgotPasswordDeveloper,
  resetPasswordDeveloper,
};
