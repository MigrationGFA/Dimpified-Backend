const bcrypt = require("bcryptjs");
const Affiliate = require("../../models/Affiliate");
const AffiliateToken = require("../../models/AffiliateToken");
const AffiliateProfile = require("../../models/AffiliateProfile");
const crypto = require("crypto");
const sendVerificationEmailAffiliate = require("../../utils/sendVerificationEmailAffiliate");
const sendWelcomeEmailAffiliate = require("../../utils/sendWelcomeEmailAffiliate");
const sendAffiliateResetPasswordAlert = require("../../utils/affiliateResetPassword");
const sendForgotPasswordEmailAffiliate = require("../../utils/sendForgotPasswordEmailAffiliate");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");

exports.affiliateSignup = async (body) => {
  // Sync the Affiliate model with the database
  await Affiliate.sync();

  const { userName, email, password } = body;
  const details = ["userName", "email", "password"];

  // Check for required details
  for (const detail of details) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }
  const userNameExists = await Affiliate.findOne({ where: { userName } });
  if (userNameExists) {
    return { status: 400, data: { message: "Username is taken" } };
  }
  // Check if the email already exists
  const emailExists = await Affiliate.findOne({ where: { email } });
  if (emailExists) {
    if (!emailExists.isVerified) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      await emailExists.update({
        userName,
        password: hashedPassword,
        verificationToken,
      });

      // Send verification email
      await sendVerificationEmailAffiliate({
        userName: emailExists.userName,
        email,
        verificationToken,
        origin: process.env.ORIGIN,
      });

      return {
        status: 201,
        data: { message: "Verification email resent successfully" },
      };
    } else {
      return {
        status: 409,
        data: {
          message: "Email address is already associated with an account",
        },
      };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(40).toString("hex");

  const generateUniqueId = () => {
    const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
    const numbers = Math.floor(100 + Math.random() * 900);
    return `${letters}${numbers}`;
  };

  const affiliateId = generateUniqueId();

  // Create a new affiliate entry in the database
  const newAffiliate = await Affiliate.create({
    userName,
    affiliateId,
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

  return { status: 201, data: { message: "Affiliate created successfully" } };
};

exports.resendEmailAffiliate = async (body) => {
  const { email } = body;

  if (!email) {
    return { status: 400, data: { message: "Email is required" } };
  }

  const affiliate = await Affiliate.findOne({ where: { email: email } });

  if (!affiliate) {
    return {
      status: 404,
      data: { msg: "No account is associated with this email address" },
    };
  }

  if (affiliate.isVerified) {
    return { status: 400, data: { msg: "Email address has been verified" } };
  }

  const newVerificationToken = crypto.randomBytes(40).toString("hex");
  affiliate.verificationToken = newVerificationToken;

  await affiliate.save();

  const origin = process.env.ORIGIN;

  await sendVerificationEmailAffiliate({
    userName: affiliate.userName,
    email: email,
    verificationToken: newVerificationToken,
    origin,
  });

  return { status: 200, data: { message: "New verification email sent" } };
};

exports.resetPasswordAffiliate = async (body) => {
  const { email, resetToken, newPassword } = body;

  const details = ["email", "resetToken", "newPassword"];
  for (const detail of details) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  const affiliate = await Affiliate.findOne({ where: { email: email } });
  if (!affiliate) {
    return { status: 404, data: { message: "Affiliate does not exist" } };
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  if (affiliate.passwordToken !== hashedToken) {
    return { status: 400, data: { message: "Invalid reset token" } };
  }

  if (affiliate.passwordTokenExpirationDate < Date.now()) {
    return { status: 400, data: { message: "Reset token has expired" } };
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

  return { status: 200, data: { message: "Password reset successfully" } };
};

exports.verifyEmailAffiliate = async (body) => {
  const { email, verificationToken } = body;

  if (!email || !verificationToken) {
    return {
      status: 400,
      data: { msg: "Email and verification token are required" },
    };
  }

  const affiliate = await Affiliate.findOne({ where: { email: email } });

  if (!affiliate) {
    return { status: 404, data: { msg: "Affiliate not found" } };
  }

  if (affiliate.isVerified) {
    return { status: 200, data: { msg: "Email has already been verified" } };
  }

  if (affiliate.verificationToken !== verificationToken) {
    return { status: 400, data: { msg: "Invalid verification token" } };
  }

  affiliate.isVerified = true;
  affiliate.verificationToken = "";
  await affiliate.save();

  await sendWelcomeEmailAffiliate({
    userName: affiliate.userName,
    email: email,
  });

  return { status: 200, data: { msg: "Email verified successfully" } };
};

exports.affiliateLogin = async (body, headers) => {
  await AffiliateToken.sync();
  const { email, password } = body;

  const details = ["password", "email"];
  for (const detail of details) {
    if (!body[detail]) {
      return { status: 400, data: { message: `${detail} is required` } };
    }
  }

  const affiliate = await Affiliate.findOne({ where: { email: email } });
  if (!affiliate) {
    return { status: 404, data: { message: "Invalid email Credential" } };
  }

  const isPasswordValid = await bcrypt.compare(password, affiliate.password);
  if (!isPasswordValid) {
    return { status: 401, data: { message: "Invalid password Credential" } };
  }

  if (!affiliate.isVerified) {
    return {
      status: 401,
      data: { msg: "Please check your email to verify your account" },
    };
  }

  const affiliateTokens = await AffiliateToken.findOne({
    where: { userId: affiliate.id },
  });
  const userAgent = headers["user-agent"];

  let accessToken, refreshToken;

  if (affiliateTokens) {
    const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const refreshTokenExpiration = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ); // 14 days from now
    accessToken = generateAccessToken(affiliate.id, affiliate.role);
    refreshToken = generateRefreshToken(affiliate.id, affiliate.role);
    await affiliateTokens.update({
      userAgent,
      accessToken,
      refreshToken,
      accessTokenExpiration,
      refreshTokenExpiration,
    });
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
  let setProfile;
  const getProfile = await AffiliateProfile.findOne({
    where: { affiliateId: affiliate.id },
  });
  let userImage = null;

  if (getProfile) {
    setProfile = true;
    userImage = getProfile.image;
  } else {
    setProfile = false;
  }

  const affiliateSubset = {
    AffiliateId: affiliate.id,
    organizationName: affiliate.userName,
    email: affiliate.email,
    affiliateId: affiliate.affiliateId,
    role: affiliate.role,
    userImage: userImage,
    profile: setProfile,
  };

  return {
    status: 200,
    data: {
      message: "Login successful",
      accessToken,
      refreshToken,
      data: affiliateSubset,
    },
  };
};

exports.forgotPasswordAffiliate = async (body) => {
  const { email } = body;

  if (!email) {
    return { status: 400, data: { message: "Email is required" } };
  }

  const affiliate = await Affiliate.findOne({ where: { email: email } });

  if (!affiliate) {
    return res.status(404).json({ message: "Affiliate does not exist" });
  }

  if (!affiliate.isVerified) {
    return { status: 401, data: { message: "Email not verified" } };
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

  return {
    status: 200,
    data: { message: "Reset password link sent successfully" },
  };
};
