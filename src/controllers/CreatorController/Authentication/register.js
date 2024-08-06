const Creator = require("../../../models/Creator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmailCreator = require("../../../utils/sendVerificationCreator");

const RegisterCreator = async (req, res) => {
  try {
    await Creator.sync();

    const { organizationName, email, password, role } = req.body;
    const details = ["organizationName", "email", "password", "role"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }

    const duplicateCreator = await Creator.findOne({
      where: {
        email: email,
      },
    });

    if (duplicateCreator) {
      // If the email is not verified, update the creator account
      if (!duplicateCreator.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        // Update creator information using the instance method 'update'
        const updateCreator = await duplicateCreator.update({
          organizationName,
          password: hashedPassword,
          verificationToken,
          role
        });

        // Send verification email
        await sendVerificationEmailCreator({
          organizationName: organizationName,
          email: email,
          verificationToken: verificationToken,
          origin: process.env.ORIGIN,
        });

        return res
          .status(201)
          .json({ message: "Verification email resent successfully" });
      } else {
        return res
          .status(409)
          .json({ message: "Email address is associated with an account" });
      }
    } else {
      // If the creator doesn't exist, create a new creator
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newCreator = await Creator.create({
        organizationName,
        email,
        password: hashedPassword,
        verificationToken,
        isVerified: false,
        role
      });

      await sendVerificationEmailCreator({
        organizationName: organizationName,
        email: email,
        verificationToken: verificationToken,
        origin: process.env.ORIGIN,
      });

      return res.status(201).json({ message: "Creator created successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = RegisterCreator;
