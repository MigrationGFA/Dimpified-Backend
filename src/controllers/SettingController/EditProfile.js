const User = require("../../models/EcosystemUser");
const path = require("path");
const fs = require("fs");

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find user by userId
    const user = await User.findByPk(userId);

    // If user not found, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      username,
      firstName,
      lastName,
      country,
      address,
      zipCode,
      city,
      phoneNumber,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "username",
      "firstName",
      "lastName",
      "country",
      "address",
      "zipCode",
      "city",
      "phoneNumber",
    ];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    let imageLink = user.imageUrl;
    if (req.file) {
      const imagePath = path.join("uploads", req.file.filename);
      if (user.imageUrl && fs.existsSync(user.imageUrl)) {
        // Remove the old image if it exists
        fs.unlinkSync(user.imageUrl);
      }
      imageLink = imagePath; // Update image link
    }

    await user.update({
      username,
      firstName,
      lastName,
      country,
      address,
      zipCode,
      city,
      phoneNumber,
      imageUrl: imageLink,
    });

    const userDetails = {
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      address: user.address,
      zipCode: user.zipCode,
      city: user.city,
      phoneNumber: user.phoneNumber,
      imageUrl: user.imageUrl,
    };

    return res.status(200).json({
      message: "Profile Updated Successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("profile ", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const userDetails = {
      ecosystemDomain: user.ecosystemDomain,
      firstName: user.firstName,
      lastName: user.lastName,
      city: user.city,
      country: user.country,
      zipcode: user.zipcode,
      image: user.imageUrl,
    };

    return res.status(200).json({ userDetails });
  } catch (error) {
    console.error("profile ", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users: ", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = { updateProfile, getUserData, getAllUsers };
