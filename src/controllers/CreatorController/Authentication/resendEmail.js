const Creator = require("../../../models/Creator");
const crypto = require("crypto");
const sendVerificationEmail = require("../../../utils/sendVerificationCreator");

const resendEmailCreator = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const creator = await Creator.findOne({ where: { email: email } });

    if (!creator) {
      return res
        .status(404)
        .json({ msg: "No account is associated with this email address" });
    }

    if (creator.isVerified) {
      return res.status(400).json({ msg: "Email address has been verified" });
    }

    const newVerificationToken = crypto.randomBytes(40).toString("hex");
    creator.verificationToken = newVerificationToken;

    await creator.save();

    const origin = process.env.ORIGIN;

    await sendVerificationEmail({
      username: creator.organizationName,
      email: creator.email,
      verificationToken: newVerificationToken,
      origin,
    });

    res.status(200).json({ message: "New verification email sent" });
  } catch (error) {
    console.error("Error during resending email:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

module.exports = resendEmailCreator;
