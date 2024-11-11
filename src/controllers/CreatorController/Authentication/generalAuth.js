const generalAuthService = require("../../../services/creatorAuthServices");

exports.forgotPassword = async (req, res) => {
  try {
    const response = await generalAuthService.forgotPassword(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.creatorLogin = async (req, res) => {
  try {
    const response = await generalAuthService.creatorLogin(req);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resendOTPCreator = async (req, res) => {
  try {
    const response = await generalAuthService.resendOTPCreator(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const response = await generalAuthService.resetPassword(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resendPasswordResetOTP = async (req, res) => {
  try {
    const response = await generalAuthService.resendPasswordResetOTP(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyResetPasswordOtp = async (req, res) => {
  try {
    const response = await generalAuthService.verifyResetPasswordOtp(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error login:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.verifyOTPCreator = async (req, res) => {
  try {
    const response = await generalAuthService.verifyOTPCreator(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.updateCreatorImage = async (req, res) => {
  try {
    const { creatorId } = req.body;
    const image = req.file.path;
    console.log("image:", image);
    const response = await generalAuthService.updateCreatorImage({
      creatorId,
      image,
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
