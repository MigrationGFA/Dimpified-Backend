const Admin = require("../../../models/GfaAdmin");
const EndUser = require("../../../models/EndUser");
const Creator = require("../../../models/Creator");
const sendWelcomeEmail = require("../../../utils/sendWelcome");

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;

  try {
    // Find the user across all user types
    const user = await Promise.any([
      Admin.findOne({ where: { email } }),
      EndUser.findOne({ where: { email } }),
      Creator.findOne({ where: { email } }),
    ]);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.isVerified) {
      return res.status(200).json({ msg: "Email has been verified" });
    }

    if (user.verificationToken !== verificationToken) {
      return res.status(400).json({ msg: "Invalid verificationToken" });
    }

    user.isVerified = true;
    user.verificationToken = "";

    await user.save();

    await sendWelcomeEmail({
      username: user.organizationName || user.email,
      email: user.email,
    });

    return res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error during email verification:", error);
    res
      .status(500)
      .json({ msg: "Internal Server Error", detail: error.message });
  }
};

module.exports = verifyEmail;
