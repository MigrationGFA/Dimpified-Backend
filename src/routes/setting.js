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
const { createCreatorSocialProfile, getCreatorSocialProfile } = require("../controllers/SettingController/creatorSocial");



const upload = multer({
  storage: UserStorage,
  limits: {
    fileSize: 104857600,
  },
});

// Ecosystem User Settings
router.get("/get-ecosystemUser-social-profile/:userId", getSocial);
router.post("/ecosystem-update-social", socialProfile);
router.delete("/user/:userId", DeleteAccount);
router.put("/ecosystemUser-profile/:userId", upload.single("image"), updateProfile);
router.get("/ecosystem-profile/:userId", getUserData);
router.get("/all-users", getAllUsers);


//creator socials handle
router.post("/add-creator-social-profile", createCreatorSocialProfile);
router.get("/get-creator-social-profile/:userId", getCreatorSocialProfile)


module.exports = router;
