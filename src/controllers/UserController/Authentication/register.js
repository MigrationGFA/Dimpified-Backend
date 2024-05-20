const User = require("../../../models/Users");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationEmail = require("../../../utils/sendEmailVerification");

const Register = async (req, res) => {
  try {
    await User.sync();

    const {
      ecosystem,
      email,
      password,
      userType,
      contactName,
      phoneNumber,
      country,
      howDidLearnAboutUs,
      numberOfTargetAudience,
      category,
    } = req.body;
    const details = [
      "ecosystem",
      "userType",
      "email",
      "password",
      "contactName",
      "phoneNumber",
      "country",
      "howDidLearnAboutUs",
      "numberOfTargetAudience",
      "category",
    ];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }
    const duplicateUser = await User.findOne({
      where: {
        email: email,
      },
    });

    if (duplicateUser) {
      // if the emailis not verify, update the user account
      if (!duplicateUser.isVerify) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        // Update user information using the instance method 'update'
        const updateUser = await duplicateUser.update({
          ecosystem,
          password: hashedPassword,
          role: userType,
          verificationToken,
          contactName,
          phoneNumber,
          country,
          howDidLearnAboutUs,
          numberOfTargetAudience,
          category,
        });

        // Send verification email
        await sendVerificationEmail({
          ecosystem: updateUser.ecosystem,
          email: updateUser.email,
          verificationToken: updateUser.verificationToken,
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
      // If the user doesn't exist, create a new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newUser = await User.create({
        ecosystem,
        email,
        password: hashedPassword,
        verificationToken,
        role: userType,
        isVerified: false,
        contactName,
        phoneNumber,
        country,
        howDidLearnAboutUs,
        numberOfTargetAudience,
        category,
      });

      await sendVerificationEmail({
        ecosystem: newUser.ecosystem,
        email: newUser.email,
        verificationToken: newUser.verificationToken,
        origin: process.env.ORIGIN,
      });

      return res.status(201).json({ message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = Register;
