const adminAuthService = require("../../services/adminServices/authentication");

exports.adminLogin = async (req, res) => {
  try {
    const response = await adminAuthService.adminLogin(req);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.adminRegister = async (req, res) => {
  try {
    const response = await adminAuthService.adminRegister(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const response = await adminAuthService.adminForgotPassword(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const response = await adminAuthService.adminResetPassword(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resendPasswordResetOTP = async (req, res) => {
  try {
    const response = await adminAuthService.resendAdminPasswordResetOTP(
      req.body
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyResetPasswordOtp = async (req, res) => {
  try {
    const response = await adminAuthService.verifyAdminResetPasswordOtp(
      req.body
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
