const Creator = require("../../../models/Creator");
const sendForgotPasswordEmailCreator = require("../../../utils/creatorForgotPassword");
const crypto = require("crypto");

const forgotPasswordCreator = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res.status(404).json({ message: "Creator does not exist" });
    }

    // Check if account has been verified
    if (!creator.isVerified) {
      return res.status(404).json({ message: "Email not verified" });
    }

    const resetToken = crypto.randomBytes(40).toString("hex");
    const resetTokenExpirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const expirationDate = Date.now() + resetTokenExpirationTime;

    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    creator.passwordToken = hashedPasswordToken;
    creator.passwordTokenExpirationDate = expirationDate;

    await creator.save();

    await sendForgotPasswordEmailCreator({
      username: creator.organizationName,
      email: creator.email,
      token: resetToken,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = forgotPasswordCreator;
