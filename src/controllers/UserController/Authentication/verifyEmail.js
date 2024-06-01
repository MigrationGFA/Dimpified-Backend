const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const sendWelcomeEmail = require("../../../utils/userWelcome");

const verifyEmailUser = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res
      .status(400)
      .json({ msg: "Email and verification token are required" });
  }

  try {
    const user = await EndUser.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ msg: "Email has already been verified" });
    }

    if (user.verificationToken !== verificationToken) {
      return res.status(400).json({ msg: "Invalid verification token" });
    }

    user.isVerified = true;
    user.verificationToken = "";
    await user.save();

    await sendWelcomeEmail({
      username: user.username,
      email: email,
    });

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = verifyEmailUser;
