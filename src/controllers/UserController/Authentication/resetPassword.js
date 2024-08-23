const EcosystemUser = require("../../../models/EcosystemUser");
const sendResetPasswordAlert = require("../../../utils/userResetPassword");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const resetPasswordUser = async (req, res) => {
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
    const user = await EcosystemUser.findOne({ where: { email: email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const currentDate = new Date();
    const expireTime = new Date(user.passwordTokenExpirationDate);
    if (hashedPasswordToken === user.passwordToken) {
      if (expireTime < currentDate) {
        return res.status(401).json({ message: "Expired reset token" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;

      await user.save();

      await sendResetPasswordAlert({
        username: user.username,
        email: user.email,
        origin: `${user.ecosystemDomain}.${process.env.ORIGIN}`,
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

module.exports = resetPasswordUser;
