const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const sendForgotPasswordEmail = require("../../../utils/sendForgottenPassword");
const crypto = require("crypto");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user across all user types
    const user = await Promise.any([
      Admin.findOne({ where: { email } }),
      EndUser.findOne({ where: { email } }),
      Creator.findOne({ where: { email } }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the account is verified
    if (!user.isVerified) {
      return res.status(404).json({ message: "Email not verified" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiration = Date.now() + 30 * 60 * 1000; // 30 minutes in milliseconds
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Update the user's password token and expiration date
    user.passwordToken = hashedResetToken;
    user.passwordTokenExpirationDate = resetTokenExpiration;

    await user.save();

    // Send the forgot password email
    await sendForgotPasswordEmail({
      username: user.organizationName || user.email,
      email: user.email,
      token: resetToken,
      origin: process.env.ORIGIN,
    });

    return res
      .status(200)
      .json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = forgotPassword;
