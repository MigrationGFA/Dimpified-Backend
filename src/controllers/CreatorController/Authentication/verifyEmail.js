const Creator = require("../../../models/Creator");
const sendWelcomeEmail = require("../../../utils/creatorWelcome");

const verifyEmailCreator = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res
      .status(400)
      .json({ msg: "Email and verification token are required" });
  }

  try {
    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res.status(404).json({ msg: "Creator not found" });
    }

    if (creator.isVerified) {
      return res.status(200).json({ msg: "Email has already been verified" });
    }

    if (creator.verificationToken !== verificationToken) {
      return res.status(400).json({ msg: "Invalid verification token" });
    }

    creator.isVerified = true;
    creator.verificationToken = "";
    await creator.save();

    await sendWelcomeEmail({
      organizationName: creator.organizationName,
      email: email,
    });

    return res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

module.exports = verifyEmailCreator;
