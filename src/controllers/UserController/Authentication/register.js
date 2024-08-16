const EcosystemUser = require("../../../models/EcosystemUser");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendVerificationUser = require("../../../utils/sendVerificationUser");
const Ecosystem = require("../../../models/Ecosystem");


const registerUser = async (req, res) => {
  try {
    await EcosystemUser.sync();
    const { username, email, password, ecosystemDomain, firstName,  lastName, phoneNumber, address, zipCode, city, country,  } = req.body;
    const details = ["username", "ecosystemDomain", "firstName",  "lastName", "phoneNumber", "address", "zipCode", "city", "country", "email", "password"];

    // Check for required details
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ msg: `${detail} is required` });
      }
    }
    // check ecosystem 
    let ecoDetails = await Ecosystem.findOne({ecosystemDomain: ecosystemDomain})
    if (!ecoDetails) {
      return res.status(200).json({ msg: "Ecosystem Not found" });
    }
    // Check if the combination of email and ecosystemDomain is unique
    const duplicateUser = await EcosystemUser.findOne({
      where: { email, ecosystemDomain },
    });
    if (duplicateUser) {
      if (!duplicateUser.isVerified) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(40).toString("hex");

        await duplicateUser.update({
          username,
          password: hashedPassword,
          firstName,  
          lastName, 
          phoneNumber, 
          address, 
          zipCode, 
          city, 
          country,
          verificationToken,
        });

        await sendVerificationUser({
          username: duplicateUser.username,
          email: duplicateUser.email,
          verificationToken: duplicateUser.verificationToken,
          origin: `${process.env.ORIGIN_HEADER}${duplicateUser.ecosystemDomain}.${process.env.ORIGIN}`,
          ecosystemName: ecoDetails.ecosystemName
        });
        console.log("this is the link", `${process.env.ORIGIN_HEADER}${duplicateUser.ecosystemDomain}.${process.env.ORIGIN}`)

        return res
          .status(201)
          .json({ message: "Verification email resent successfully" });
      } else {
        return res
          .status(409)
          .json({
            message:
              "An account with this email already exists",
          });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(40).toString("hex");

      const newUser = await EcosystemUser.create({
        username,
        email,
        password: hashedPassword,
        verificationToken,
        ecosystemDomain,
         firstName,  
         lastName, 
          phoneNumber, 
          address, 
          zipCode, 
          city, 
          country,
        isVerified: false,
      });

      await sendVerificationUser({
        username: newUser.username,
        email: newUser.email,
        verificationToken: newUser.verificationToken,
        origin: `${process.env.ORIGIN_HEADER}${newUser.ecosystemDomain}.${process.env.ORIGIN}`,
        ecosystemName: ecoDetails.ecosystemName
      });
      console.log("this is the link", `${process.env.ORIGIN_HEADER}${newUser.ecosystemDomain}.${process.env.ORIGIN}`)

      return res.status(201).json({ message: "User created successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = registerUser;
