const Creator = require("../../../models/Creator");
const sendResetPasswordAlert = require("../../../utils/creatorResetPassword");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const resetPasswordCreator = async (req, res) => {
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

    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const currentDate = new Date();
    const expireTime = new Date(creator.passwordTokenExpirationDate);

    if (hashedPasswordToken !== creator.passwordToken) {
      return res.status(401).json({ msg: "Incorrect password token" });
    }

    if (expireTime <= currentDate) {
      return res.status(401).json({ message: "Expired reset token" });
    }

    creator.password = await bcrypt.hash(newPassword, 10);
    creator.passwordToken = null;
    creator.passwordTokenExpirationDate = null;

    await creator.save();

    await sendResetPasswordAlert({
      organizationName: organizationName,
      email: email,
      verificationToken: verificationToken,
      origin: process.env.ORIGIN,
    });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = resetPasswordCreator;
