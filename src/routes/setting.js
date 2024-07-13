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

// Ecosystem User Settings
router.get("/get-ecosystemUser-social-profile/:userId", getSocial);
router.post("/ecosystem-update-social", socialProfile);
router.delete("/user/:userId", DeleteAccount);
router.put("/ecosystemUser-profile/:userId", upload.single("image"), updateProfile);
router.get("/profile/:userId", getUserData);

router.get("/all-users", getAllUsers);

module.exports = router;
