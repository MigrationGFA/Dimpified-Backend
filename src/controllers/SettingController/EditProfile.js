const User = require("../../models/EcosystemUser");
const path = require("path");
const fs = require("fs");
const { isValidFile } = require("../../helper/multerUpload");

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

    let imageLink;

     if (req.file) {
        const newImage = req.file;
        if (!isValidFile(newImage)) {
          return res.status(400).json({ message: "Invalid image file" });
        }
        imageLink = `https://dimpified-backend-development.azurewebsites.net/${newImage.path}`;
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

    const userDetails = await User.findByPk(userId, { attributes: { 
        exclude: [
          'password', 
          'passwordToken', 
          'passwordTokenExpirationDate', 
          'verificationToken',
          "createdAt",
          "updatedAt"
        ]
      }});

    if (!userDetails) {
      return res.status(404).json({ message: "User does not exist" });
    }

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
