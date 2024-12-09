const sendForgotPasswordOTP = require("../../utils/sendPasswordResetOTP");
const sendResetPasswordAlert = require("../../utils/sendPasswordAlert");
const sendVerificationEmail = require("../../utils/sendVerificationEmailAdmin");
const bcrypt = require("bcryptjs");
const AdminUser = require("../../models/AdminUser");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/generateToken");
const AdminToken = require("../../models/AdminToken");

exports.adminRegister = async (body) => {
  const { fullName, email, password, role } = body;

  // Validate required fields
  const requiredFields = ["email", "password", "role", "fullName"];
  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  // Check if AdminUser already exists
  const duplicateAdmin = await AdminUser.findOne({ where: { email } });
  if (duplicateAdmin) {
    return {
      status: 409,
      data: {
        message: "Email address is already associated with an account",
      },
    };
  }

  // Create a new AdminUser
  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = await AdminUser.create({
    fullName,
    email,
    password: hashedPassword,
    isVerified: false,
    role,
  });

  return {
    status: 201,
    data: {
      message: "Admin registered successfully.",
      user: {
        adminId: newAdmin.id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    },
  };
};

exports.adminLogin = async (body) => {
  const { email, password } = body;

  // Validate required fields
  if (!email || !password) {
    return {
      status: 400,
      data: { message: "Email and password are required" },
    };
  }

  // Find admin by email
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) {
    return { status: 401, data: { message: "Invalid email credentials" } };
  }

  // Check password validity
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return { status: 401, data: { message: "Invalid password credentials" } };
  }

  // Generate access and refresh tokens
  const accessTokenExpiration = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  const refreshTokenExpiration = new Date(
    Date.now() + 14 * 24 * 60 * 60 * 1000
  ); // 14 days
  const accessToken = generateAccessToken(admin.id, admin.role);
  const refreshToken = generateRefreshToken(admin.id, admin.role);

  // Update or create tokens in database
  const adminToken = await AdminToken.findOne({ where: { userId: admin.id } });
  const userAgent = req.headers["user-agent"];

  if (adminToken) {
    await adminToken.update({
      accessToken,
      refreshToken,
      userAgent,
      accessTokenExpiration,
      refreshTokenExpiration,
    });
  } else {
    await AdminToken.create({
      accessToken,
      refreshToken,
      userId: admin.id,
      userAgent,
      accessTokenExpiration,
      refreshTokenExpiration,
    });
  }

  // Subset of admin data for response
  const adminData = {
    adminId: admin.id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
  };

  return {
    status: 200,
    data: {
      message: "Login successful",
      accessToken,
      refreshToken,
      user: adminData,
    },
  };
};

exports.adminForgotPassword = async ({ email }) => {
  // Validate email input
  if (!email) {
    return { status: 400, data: { message: "Email is required" } };
  }

  // Find the admin user by email
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) {
    return { status: 404, data: { message: "Admin user not found" } };
  }

  // Generate OTP and set expiration
  const OTP = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
  const resetTokenExpirationTime = 5 * 60 * 1000; // Token valid for 5 minutes
  const expirationDate = new Date(Date.now() + resetTokenExpirationTime);

  // Update admin user with OTP and expiration date
  await admin.update({
    passwordToken: OTP,
    passwordTokenExpirationDate: expirationDate,
  });

  // Send password reset email
  await sendForgotPasswordOTP({
    username: admin.fullName,
    email: admin.email,
    OTP,
    origin: process.env.ORIGIN, // Frontend URL for reset
  });

  // Respond with success
  return {
    status: 200,
    data: { message: "Password reset email sent successfully" },
  };
};

exports.adminResetPassword = async ({ email, password }) => {
  // Validate required fields
  if (!email || !password) {
    return {
      status: 400,
      data: { message: "Email and password are required" },
    };
  }

  // Find the admin user by email
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) {
    return { status: 404, data: { message: "Admin user not found" } };
  }

  // Check if the reset token is still valid
  if (
    !admin.passwordTokenExpirationDate ||
    admin.passwordTokenExpirationDate < Date.now()
  ) {
    return { status: 400, data: { message: "Reset token has expired" } };
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the admin's password and clear the reset token fields
  await admin.update({
    password: hashedPassword,
    passwordToken: null,
    passwordTokenExpirationDate: null,
  });

  // Send a notification alert about the password reset
  await sendResetPasswordAlert({
    username: admin.fullName,
    email: admin.email,
    origin: process.env.ORIGIN,
  });

  // Respond with success
  return { status: 200, data: { message: "Password reset successfully" } };
};

exports.resendAdminPasswordResetOTP = async ({ email }) => {
  // Validate the email field
  if (!email) {
    return { status: 400, data: { message: "Email is required" } };
  }

  // Find the admin user by email
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) {
    return { status: 404, data: { message: "Admin user not found" } };
  }

  // Generate a new OTP and set expiration time
  const OTP = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
  const resetTokenExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  const expirationDate = Date.now() + resetTokenExpirationTime;

  // Update the admin's reset token and expiration date
  await admin.update({
    passwordToken: OTP,
    passwordTokenExpirationDate: expirationDate,
  });

  // Send OTP via email
  await sendForgotPasswordOTP({
    username: admin.fullName || "Admin", // Fallback to a default name if fullName is not available
    email: admin.email,
    OTP,
    origin: process.env.ORIGIN,
  });

  // Respond with success
  return {
    status: 200,
    data: { message: "Password reset email resent successfully" },
  };
};

exports.verifyAdminResetPasswordOtp = async ({ email, OTP }) => {
  // Validate required fields
  const requiredFields = { email, OTP };
  for (const [key, value] of Object.entries(requiredFields)) {
    if (!value) {
      return { status: 400, data: { message: `${key} is required` } };
    }
  }

  // Find the admin user by email
  const admin = await AdminUser.findOne({ where: { email } });
  if (!admin) {
    return { status: 404, data: { message: "Admin user not found" } };
  }

  // Validate the OTP
  if (admin.passwordToken !== OTP) {
    return { status: 400, data: { message: "Invalid password token" } };
  }

  // Check if the OTP has expired
  if (admin.passwordTokenExpirationDate < Date.now()) {
    return { status: 400, data: { message: "Password token has expired" } };
  }

  // Clear the OTP and extend the expiration time
  admin.passwordToken = ""; // Clear OTP for security
  const resetTokenExpirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  admin.passwordTokenExpirationDate = Date.now() + resetTokenExpirationTime;

  // Save changes
  await admin.save();

  // Return a success message
  return { status: 200, data: { message: "OTP successfully verified" } };
};
