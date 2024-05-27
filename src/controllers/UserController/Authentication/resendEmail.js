const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const sendVerificationEmail = require("../../../utils/sendEmailVerification");

const resendEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user across all user types
    const user = await Promise.any([
      Admin.findOne({ where: { email } }),
      EndUser.findOne({ where: { email } }),
      Creator.findOne({ where: { email } }),
    ]);

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

    // Generate a new verification token
    const newVerificationToken = crypto.randomBytes(40).toString("hex");
    user.verificationToken = newVerificationToken;
    await user.save();

    // Send the verification email
    await sendVerificationEmail({
      username: user.organizationName || user.email,
      email: user.email,
      verificationToken: newVerificationToken,
      origin: process.env.ORIGIN,
    });

    return res.status(200).json({ message: "New verification email sent" });
  } catch (error) {
    console.error("Error during resend email:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

module.exports = resendEmail;
