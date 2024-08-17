const EcosystemUser = require("../../../models/EcosystemUser");
const sendForgotPasswordEmailUser = require("../../../utils/userForgottenPassword");
const crypto = require("crypto");

const forgotPasswordUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await EcosystemUser.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    if (!user.isVerified) {
      return res.status(404).json({ message: "Email not verified" });
    }

    const resetToken = crypto.randomBytes(40).toString("hex");
    const resetTokenExpirationTime = 30 * 60 * 1000;
    const expirationDate = Date.now() + resetTokenExpirationTime;
    const hashedPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordToken = hashedPasswordToken;
    user.passwordTokenExpirationDate = expirationDate;

    await user.save();

    await sendForgotPasswordEmailUser({
      username: user.username,
      email: user.email,
      token: resetToken,
      origin: `${user.ecosystemDomain}.${process.env.ORIGIN}`,
    });

    res.status(200).json({ message: "Reset password link sent successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = forgotPasswordUser;
