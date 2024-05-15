const User = require("../../../models/Users");
const sendForgotPasswordEmail = require("../../../utils/sendForgottenPassword");
const crypto = require("crypto");
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: `email is required` });
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // to checkif account have been verified
    if (!user.isVerified) {
      return res.status(404).json({ message: `email not verified` });
    }

    const resetToken = crypto.randomBytes(40).toString("hex");
    const resetTokenExpirationTime = 30 * 60 * 1000; // 30 minutes in milliseconds
    const expirationDate = Date.now() + resetTokenExpirationTime;
    console.log("this is expire date", expirationDate);
    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordToken = hashedPasswordToken;
    user.passwordTokenExpirationDate = expirationDate;

    await user.save();

    await sendForgotPasswordEmail({
      username: user.username,
      email: user.email,
      token: resetToken,
      origin: process.env.ORIGIN,
    });
    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = forgotPassword;

// const user = await User.findOne({ where: { email:email }});
