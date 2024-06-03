const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const crypto = require("crypto");
const sendVerificationEmail = require("../../../utils/sendVerificationUser");

const resendEmailUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const user = await EndUser.findOne({ where: { email: email } });
    if (!user) {
      return res
        .status(404)
        .json({ msg: "No account is associated with this email address" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ msg: "Email address has already been verified" });
    }

    const newVerificationToken = crypto.randomBytes(40).toString("hex");

    user.verificationToken = newVerificationToken;
    await user.save();

    await sendVerificationEmail({
      username: user.username,
      email: user.email,
      verificationToken: newVerificationToken,
      origin: process.env.ORIGIN,
    });

    res.status(200).json({ message: "New verification email sent" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = resendEmailUser;
