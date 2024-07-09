const EcosystemUser = require("../../../models/EcosystemUser");
const sendWelcomeEmail = require("../../../utils/userWelcome");
const Template = require("../../../models/Templates");
const Ecosystem = require("../../../models/Ecosystem");




const verifyEmailUser = async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    return res
      .status(400)
      .json({ msg: "Email and verification token are required" });
  }

  try {
    const user = await EcosystemUser.findOne({ where: { email: email } });
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

    const ecoDetails = await Ecosystem.findOne({ecosystemDomain: user.ecosystemDomain})
    if (!ecoDetails) {
      return res.status(200).json({ msg: "Ecosystem Not found" });
    }

    const templateDetails = await Template.findOne({_id: ecoDetails.templates})
    await sendWelcomeEmail({
      email: email,
      username: user.username, 
      ecosystemName: ecoDetails.ecosystemName, 
      logo: templateDetails.navbar.logo, 
      login: `${process.env.ORIGIN}/${ecoDetails.ecosystemDomain}/login`
    });

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = verifyEmailUser;
