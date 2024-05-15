const User = require("../../../models/Users");
const sendResetPasswordAlert = require("../../../utils/sendPasswordAlert");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
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
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    console.log("this is user token", user.passwordToken);
    const currentDate = new Date();
    const expireTime = new Date(user.passwordTokenExpirationDate);
    if (hashedPasswordToken === user.passwordToken) {
      if (expireTime > currentDate) {
        return res.status(401).json({ message: "expired reset token" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;

      await user.save();

      await sendResetPasswordAlert({
        username: user.username,
        email: user.email,
        origin: process.env.ORIGIN,
      });
      return res.status(200).json({ message: "Password reset successfully" });
    } else {
      return res.status(401).json({ msg: "Incorrect password token" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = resetPassword;
