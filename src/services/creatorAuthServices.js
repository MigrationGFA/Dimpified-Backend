// services/authService.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Creator = require("../models/Creator");
const CreatorProfile = require("../models/CreatorProfile");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");
const sendVerificationOTPCreator = require("../utils/sendVerificationOTPCreator");
const sendWelcomeEmailCreator = require("../utils/creatorWelcome");
const sendForgotPasswordOTP = require("../utils/sendPasswordResetOTP");
const sendResetPasswordAlert = require("../utils/sendPasswordAlert");

const CreatorToken = require("../models/CreatorToken");
const Subscription = require("../models/Subscription");
const Ecosystem = require("../models/Ecosystem");

const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// sign-up category 1
exports.creatorSignup = async (body) => {
  const {
    fullName,
    email,
    password,
    role,
    refCode,
    organizationName,
    phoneNumber,
    gender,
    dateOfBirth,
  } = body;

  const requiredFields = ["email", "password", "role"];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  const duplicateCreator = await Creator.findOne({ where: { email } });
  if (duplicateCreator) {
    if (!duplicateCreator.isVerified) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const OTP = Math.floor(100000 + Math.random() * 900000);

      await duplicateCreator.update({
        organizationName,
        password: hashedPassword,
        verificationToken: OTP,
        role,
      });

      await sendVerificationOTPCreator({
        organizationName: fullName,
        email,
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

      const user = {
        creatorId: duplicateCreator.id,
        fullName: duplicateCreator.fullName,
        email: duplicateCreator.email,
        role: duplicateCreator.role,
        profile: true,
        step: duplicateCreator.step,
      };

      return {
        status: 201,
        data: {
          message: "Verification email resent successfully",
          accessToken,
          refreshToken,
          user,
        },
      };
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
        fullName: duplicateCreator.fullName,
        email: duplicateCreator.email,
        role: duplicateCreator.role,
        profile: true,
        step: duplicateCreator.step,
      };

      return {
        status: 409,
        data: {
          message: "Email address is associated with an account",
          accessToken,
          refreshToken,
          user,
        },
      };
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const OTP = Math.floor(100000 + Math.random() * 900000);

  const newCreator = await Creator.create({
    organizationName,
    email,
    password: hashedPassword,
    verificationToken: OTP,
    isVerified: false,
    role,
    step: 1,
    affiliateId: refCode === "not available" ? null : refCode,
  });

  const newCreatorProfile = await CreatorProfile.create({
    fullName,
    email,
    organizationName,
    phoneNumber,
    gender,
    dateOfBirth: new Date(dateOfBirth),
    creatorId: newCreator.id,
  });

  await sendVerificationOTPCreator({
    organizationName: fullName,
    email,
    verificationToken: OTP,
    origin: process.env.ORIGIN,
  });

  const accessToken = generateAccessToken(newCreator.id, newCreator.role);
  const refreshToken = generateRefreshToken(newCreator.id, newCreator.role);

  const user = {
    creatorId: newCreator.id,
    fullName: newCreatorProfile.fullName,
    email: newCreator.email,
    role: newCreator.role,
    profile: true,
    step: newCreator.step,
  };

  return {
    status: 201,
    data: {
      message: "Creator created successfully",
      accessToken,
      refreshToken,
      user,
    },
  };
};

// verify otp
exports.verifyOTPCreator = async ({ email, OTP }) => {
  if (!email || !OTP) {
    return { status: 400, data: { message: "Email and OTP are required" } };
  }

  const creator = await Creator.findOne({ where: { email } });
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }
  console.log(creator);

  if (creator.verificationToken !== OTP) {
    return { status: 400, data: { message: "Invalid OTP" } };
  }
  const creatorProfile = await CreatorProfile.findOne({
    creatorId: creator.id,
  });
  await sendWelcomeEmailCreator({
    organizationName: creatorProfile.fullName,
    email,
  });

  creator.isVerified = true;
  creator.verificationToken = "";
  creator.step = 2;
  await creator.save();

  return { status: 200, data: { message: "Email verified successfully" } };
};

// forgot password
exports.forgotPassword = async ({ email }) => {
  if (!email) {
    return { status: 400, data: { message: "Email is required" } };
  }

  const creator = await Creator.findOne({ where: { email } });
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }

  const OTP = Math.floor(100000 + Math.random() * 900000);
  const resetTokenExpirationTime = 5 * 60 * 1000;
  const expirationDate = Date.now() + resetTokenExpirationTime;

  creator.passwordToken = OTP;
  creator.passwordTokenExpirationDate = expirationDate;

  await creator.save();

  const creatorProfile = await CreatorProfile.findOne({
    email,
  });

  if (!creatorProfile) {
    return { status: 404, data: { message: "CreatorProfile not found" } };
  }

  sendForgotPasswordOTP({
    username: creatorProfile.fullName,
    email,
    OTP,
    origin: process.env.ORIGIN,
  });
  return {
    status: 200,
    data: { message: "Password reset email sent succesfully" },
  };
};

exports.creatorLogin = async (req) => {
  const { email, password } = req.body;
  const details = ["password", "email"];

  for (const [key, value] of Object.entries(details)) {
    if (!value) {
      return { status: 400, data: { message: `${key} is required` } };
    }
  }

  const creator = await Creator.findOne({ where: { email: email } });
  if (!creator) {
    return { status: 401, data: { message: "Invalid email Credential" } };
  }

  const isPasswordValid = await bcrypt.compare(password, creator.password);
  if (!isPasswordValid) {
    return { status: 401, data: { message: "Invalid password Credential" } };
  }

  if (!creator.isVerified) {
    return {
      status: 401,
      data: { message: "Please check your email to verify your account" },
    };
  }

  const creatorTokens = await CreatorToken.findOne({
    where: { userId: creator.id },
  });

  const userAgent = req.headers["user-agent"];
  const hasInterests =
    creator.categoryInterest && creator.categoryInterest !== null
      ? "yes"
      : "no";

  let accessToken, refreshToken;

  if (creatorTokens) {
    const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const refreshTokenExpiration = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ); // 14 days from now
    accessToken = generateAccessToken(creator.id, creator.role);
    refreshToken = generateRefreshToken(creator.id, creator.role);
    await creatorTokens.update({
      userAgent,
      accessToken,
      refreshToken,
      accessTokenExpiration,
      refreshTokenExpiration,
    });
  } else {
    accessToken = generateAccessToken(creator.id, creator.role);
    refreshToken = generateRefreshToken(creator.id, creator.role);
    const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    const refreshTokenExpiration = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000
    ); // 14 days from now

    const myToken = await CreatorToken.create({
      accessToken,
      refreshToken,
      userId: creator.id,
      userAgent,
      accessTokenExpiration,
      refreshTokenExpiration,
      type: "Creator",
    });
  }

  // Assuming setProfile is determined by certain fields being non-null
  let setProfile =
    creator.organizationName && creator.categoryInterest ? true : false;

  // Get Subscription Plan
  const getSubscription = await Subscription.findOne({
    where: {
      creatorId: creator.id,
    },
  });

  let plan;
  if (!getSubscription) {
    plan = "Lite";
  } else {
    plan = getSubscription.planType;
  }

  const creatorEcosystem = await Ecosystem.findOne({
    creatorId: creator.id,
  });

  let ecosystemDomain = null;
  if (creatorEcosystem) {
    ecosystemDomain = creatorEcosystem.ecosystemDomain;
    console.log(ecosystemDomain);
  }

  let fullName = null;
  const getProfile = await CreatorProfile.findOne({
    creatorId: creator.id,
  });

  if (getProfile) {
    fullName = getProfile.fullName;
  }

  // Subset of Creator's data for response
  const creatorSubset = {
    creatorId: creator.id,
    organizationName: creator.organizationName,
    fullName: fullName,
    email: creator.email,
    role: creator.role,
    image: creator.imageUrl,
    interest: hasInterests,
    profile: setProfile,
    plan: plan,
    step: creator.step,
    ecosystemDomain: ecosystemDomain,
  };

  return {
    status: 200,
    data: {
      message: "Login successful",
      accessToken,
      refreshToken,
      user: creatorSubset,
    },
  };
};

// resend sign up otp
exports.resendOTPCreator = async ({ email }) => {
  if (!email) {
    return { status: 400, data: { message: "Email is required" } };
  }
  const creator = await Creator.findOne({ where: { email: email } });

  if (!creator) {
    return {
      status: 404,
      data: { msg: "No account is associated with this email address" },
    };
  }

  if (creator.isVerified) {
    return { status: 400, data: { msg: "Email address has been verified" } };
  }

  const newVerificationToken = crypto.randomBytes(40).toString("hex");
  creator.verificationToken = newVerificationToken;

  await creator.save();
  const creatorProfile = await CreatorProfile.findOne({
    creatorId: creator.id,
  });

  await sendVerificationOTPCreator({
    organizationName: creatorProfile.fullName,
    email: email,
    verificationToken: OTP,
    origin: process.env.ORIGIN,
  });

  return { status: 200, data: { message: "New verification email sent" } };
};

// creator reset password
exports.resetPassword = async ({ email, password }) => {
  const requiredFields = ["email", "password"];

  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return { status: 400, data: { message: `${key} is required` } };
    }
  }
  const creator = await Creator.findOne({ where: { email } });
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }
  if (creator.passwordTokenExpirationDate < Date.now()) {
    return { status: 400, data: { message: "Reset token has expired" } };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  creator.password = hashedPassword;
  creator.passwordTokenExpirationDate = null;

  await creator.save();
  const creatorProfile = await CreatorProfile.findOne({
    creatorId: creator.id,
  });

  await sendResetPasswordAlert({
    username: creatorProfile.fullName,
    email,
    origin: process.env.ORIGIN,
  });

  return { status: 400, data: { message: "Password reset succesfully" } };
};

// resent reset password otp
exports.resendPasswordResetOTP = async ({ email }) => {
  if (!email) {
    return { status: 400, data: { message: "email is required" } };
  }

  const creator = await Creator.findOne({ where: { email } });
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }

  const OTP = Math.floor(100000 + Math.random() * 900000);
  const resetTokenExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  const expirationDate = Date.now() + resetTokenExpirationTime;

  creator.passwordToken = OTP;
  creator.passwordTokenExpirationDate = expirationDate;

  await creator.save();

  const creatorProfile = await CreatorProfile.findOne({
    email,
  });
  if (!creatorProfile) {
    return { status: 404, data: { message: "CreatorProfile not found" } };
  }

  sendForgotPasswordOTP({
    username: creatorProfile.fullName,
    email,
    OTP,
    origin: process.env.ORIGIN,
  });

  return {
    status: 200,
    data: { message: "Password reset email resent succesfully" },
  };
};

// verify reset password token
exports.verifyResetPasswordOtp = async ({ email, OTP }) => {

  const details = ["email", "OTP"];


  for (const [key, value] of Object.entries(details)) {
    if (!value) {
      return { status: 400, data: { message: `${key} is required` } };
    }
  }
  const creator = await Creator.findOne({ where: { email } });
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }
  if (creator.passwordToken !== OTP) {
    return { status: 400, data: { message: "Invalid password token" } };
  }

  creator.passwordToken = "";

  const resetTokenExpirationTime = 5 * 60 * 1000; // 30 minutes in milliseconds
  const expirationDate = Date.now() + resetTokenExpirationTime;

  creator.passwordTokenExpirationDate = expirationDate;

  await creator.save();
  console.log("creator:", creator);

  return { status: 200, data: { message: "OTP successfully verified" } };
};

exports.updateCreatorImage = async ({ creatorId, image }) => {
  if (!image) {
    return { status: 400, data: { message: "Image is required" } };
  }

  // Upload the image to Cloudinary
  const uploadedImage = await cloudinary.uploader.upload(image, {
    resource_type: "image",
  });

  // Find the creator's profile
  const creatorProfile = await CreatorProfile.findOne({ creatorId });
  if (!creatorProfile) {
    return { status: 404, data: { message: "Creator profile not found" } };
  }

  const creator = await Creator.findByPk(creatorId)
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }

  // Update the image URL in the profile
  creatorProfile.image = uploadedImage.secure_url;
  creator.imageUrl = uploadedImage.secure_url;

  await creatorProfile.save();
  await creator.save();

  // Return success response
  return {
    status: 200,
    data: {
      message: "Profile image updated successfully",
      Profile: creatorProfile,
      creator
    },
  };
};
