const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const sendResetPasswordAlert = require("../../../utils/sendPasswordAlert");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await Promise.any([
      Admin.findOne({ where: { email } }),
      EndUser.findOne({ where: { email } }),
      Creator.findOne({ where: { email } }),
    ]);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verify the reset token
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    if (hashedResetToken !== user.passwordToken) {
      return res.status(401).json({ message: "Invalid reset token" });
    }

    // Check if the reset token has expired
    const currentDate = new Date();
    if (currentDate > new Date(user.passwordTokenExpirationDate)) {
      return res.status(401).json({ message: "Expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the password token fields
    user.password = hashedPassword;
    user.passwordToken = null;
    user.passwordTokenExpirationDate = null;
    await user.save();

    // Send password reset alert
    await sendResetPasswordAlert({
      username: user.organizationName || user.email,
      email: user.email,
      origin: process.env.ORIGIN,
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = resetPassword;
