const Affiliate = require("../../models/Affiliate");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

const AffiliateToken = require("../../models/AffiliateToken");
//const sendWelcomeEmailAffiliate = require("../../utils/sendWelcomeEmailAffiliate");
//const sendForgotPasswordEmailAffiliate = require("../../utils/sendForgotPasswordAffiliate");
const sendAffiliateResetPasswordAlert = require("../../utils/resetPasswordAlert");
const sendVerificationEmailAffiliate = require("../../utils/sendVerificationEmailAffiliate");
const sendWelcomeEmailAffiliate = require("../../utils/sendWelcomeEmailAffiliate");
const sendForgotPasswordEmailAffiliate = require("../../utils/sendForgotPasswordEmailAffiliate");


const affiliateSignup = async (req, res) => {
  try {
    // Sync the Affiliate model with the database
    await Affiliate.sync();

    const { userName, email, password } = req.body;
    const details = ["userName", "email", "password"];

    // Check for required details
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    // Check if the email already exists
    const emailExists = await Affiliate.findOne({ where: { email } });
    if (emailExists) {
      // If the user exists but verification token is not present, resend verification email
      if (!emailExists.verificationToken) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        // Update the existing user details and add a new verification token
        await emailExists.update({
          userName,
          password: hashedPassword,
          verificationToken,
        });

        // Send verification email
        await sendVerificationEmailAffiliate({
          userName: emailExists.userName, // You can also use userName
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
          .json({
            message: "Email address is already associated with an account",
          });
      }
    }

    // If email does not exist, create a new affiliate
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(40).toString("hex");

    // Create a new affiliate entry in the database
    const newAffiliate = await Affiliate.create({
      userName,
      email,
      password: hashedPassword,
      verificationToken,
      role: "affiliate", // Default role
    });

    // Send verification email
    await sendVerificationEmailAffiliate({
      userName: newAffiliate.userName,
      email,
      verificationToken,
      origin: process.env.ORIGIN,
    });

    return res.status(201).json({ message: "Affiliate created successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const affiliateLogin = async (req, res) => {
  try {
    await AffiliateToken.sync();
    const { email, password } = req.body;

    const details = ["password", "email"];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const affiliate = await Affiliate.findOne({ where: { email: email } });
    if (!affiliate) {
      return res.status(404).json({ message: "Invalid email Credential" });
    }

    const isPasswordValid = await bcrypt.compare(password, affiliate.password);
    if (!isPasswordValid) {
      return res.status(404).json({ message: "Invalid password Credential" });
    }

    if (!affiliate.isVerified) {
      return res
        .status(401)
        .json({ msg: "Please check your email to verify your account" });
    }

    const affiliateTokens = await AffiliateToken.findOne({
      where: { userId: affiliate.id },
    });
    const currentDate = new Date();
    const userAgent = req.headers["user-agent"];

    let accessToken, refreshToken;

    if (
      affiliateTokens &&
      affiliateTokens.accessTokenExpiration > currentDate &&
      affiliateTokens.refreshTokenExpiration > currentDate
    ) {
      accessToken = affiliateTokens.accessToken;
      refreshToken = affiliateTokens.refreshToken;
      await affiliateTokens.update({ userAgent });
    } else {
      accessToken = generateAccessToken(affiliate.id, affiliate.role);
      refreshToken = generateRefreshToken(affiliate.id, affiliate.role);
      const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const refreshTokenExpiration = new Date(
        Date.now() + 15 * 24 * 60 * 60 * 1000
      ); // 15 days

      await AffiliateToken.create({
        accessToken,
        refreshToken,
        userId: affiliate.id,
        userAgent,
        accessTokenExpiration,
        refreshTokenExpiration,
      });
    }

    let setProfile = affiliate.userName && affiliate.email ? true : false;

    const affiliateSubset = {
      AffiliateId: affiliate.id,
      userName: affiliate.userName,
      email: affiliate.email,
      role: affiliate.role,
      profile: setProfile,
    };

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: affiliateSubset,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const verifyEmailAffiliate = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res
      .status(400)
      .json({ msg: "Email and verification token are required" });
  }

  try {
    const affiliate = await Affiliate.findOne({ where: { email: email } });

    if (!affiliate) {
      return res.status(404).json({ msg: "Affiliate not found" });
    }

    if (affiliate.isVerified) {
      return res.status(200).json({ msg: "Email has already been verified" });
    }

    if (affiliate.verificationToken !== verificationToken) {
      return res.status(400).json({ msg: "Invalid verification token" });
    }

    affiliate.isVerified = true;
    affiliate.verificationToken = "";
    await affiliate.save();

    await sendWelcomeEmailAffiliate({
      userName: affiliate.userName,
      email: email,
    });

    return res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const affiliateLogOut = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const affiliateToken = await AffiliateToken.findByPk(userId)

    if (!affiliateToken) {
      return res.status(404).json({ message: "No token found for this user" });
    }

    await affiliateToken.destroy();
    return res
      .status(200)
      .json({ message: "Affiliate logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const forgotPasswordAffiliate = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const affiliate = await Affiliate.findOne({ where: { email: email } });

    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate does not exist" });
    }

    if (!affiliate.isVerified) {
      return res.status(404).json({ message: "Email not verified" });
    }

    const resetToken = crypto.randomBytes(40).toString("hex");
    const resetTokenExpirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const expirationDate = Date.now() + resetTokenExpirationTime;

    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    affiliate.passwordToken = hashedPasswordToken;
    affiliate.passwordTokenExpirationDate = expirationDate;

    await affiliate.save();

    await sendForgotPasswordEmailAffiliate({
      userName: affiliate.userName,
      email: affiliate.email,
      token: resetToken,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

const resetPasswordAffiliate = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const details = ["email", "resetToken", "newPassword"];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const affiliate = await Affiliate.findOne({ where: { email: email } });
    if (!affiliate) {
      return res.status(404).json({ message: "Affiliate does not exist" });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    if (affiliate.passwordToken !== hashedToken) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (affiliate.passwordTokenExpirationDate < Date.now()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    affiliate.password = hashedPassword;
    affiliate.passwordToken = "";
    affiliate.passwordTokenExpirationDate = null;

    await affiliate.save();

    await sendAffiliateResetPasswordAlert({
      userName: affiliate.userName,
      email: affiliate.email,
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = {
  affiliateSignup,
  affiliateLogin,
  verifyEmailAffiliate,
  affiliateLogOut,
  forgotPasswordAffiliate,
  resetPasswordAffiliate,
};
