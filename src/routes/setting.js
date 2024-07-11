const express = require("express");
const router = express.Router();
const multer = require("multer");
const { UserStorage } = require("../helper/multerUpload");

const {
  socialProfile,
  getSocial,
} = require("../controllers/SettingController/SocialProfile");
const DeleteAccount = require("../controllers/SettingController/DeleteAccount");
const {
  updateProfile,
  getUserData,
  getAllUsers,
} = require("../controllers/SettingController/EditProfile");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: UserStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

//Get a social profile
router.get("/get-social-profile/:userId", getSocial);

// Update or create a Social profile
router.post("/update-social", socialProfile);

// Delete user Account
router.delete("/user/:userId", DeleteAccount);

// Edit a User Profile
router.put("/profile/:userId", upload.single("image"), updateProfile);

// Get a User Profile
router.get("/profile/:userId", getUserData);

router.get("/all-users", getAllUsers);

module.exports = router;
