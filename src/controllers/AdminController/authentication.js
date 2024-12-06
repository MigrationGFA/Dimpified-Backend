// const adminAuthService = require("../../services/adminServices/authentication")

// exports.creatorLogin = async (req, res) => {
//   try {
//     const response = await adminAuthService.creatorLogin(req);
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error login:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.creatorRegister = async (req, res) => {
//   try {
//     const response = await adminAuthService.creatorRegister(req);
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error login:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.forgotPassword = async (req, res) => {
//   try {
//     const response = await adminAuthService.adminForgotPassword(req.body);
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error verifying email:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   try {
//     const response = await adminAuthService.adminResetPassword(req.body);
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error login:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.resendPasswordResetOTP = async (req, res) => {
//   try {
//     const response = await adminAuthService.adminResendPasswordResetOTP(req.body);
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error login:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// exports.verifyResetPasswordOtp = async (req, res) => {
//   try {
//     const response = await generalAuthService.adminVerifyResetPasswordOtp(req.body);
//     return res.status(response.status).json(response.data);
//   } catch (error) {
//     console.error("Error login:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };