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

const 
  authenticatedUser
 = require("../middleware/authentication")


const upload = multer({
  storage: UserStorage,
  limits: {
    fileSize: 104857600,
  },
});

// Ecosystem User Settings
router.get("/get-ecosystemUser-social-profile/:userId", authenticatedUser, getSocial);
router.post("/ecosystem-update-social", authenticatedUser, socialProfile);
router.delete("/user/:userId", authenticatedUser, DeleteAccount);
router.put("/ecosystemUser-profile/:userId", authenticatedUser, upload.single("image"), updateProfile);
router.get("/ecosystem-profile/:userId", authenticatedUser, getUserData);
router.get("/all-users", authenticatedUser, getAllUsers);


//creator socials handle
router.post("/add-creator-social-profile", authenticatedUser, createCreatorSocialProfile);
router.get("/get-creator-social-profile/:userId", authenticatedUser, getCreatorSocialProfile)


module.exports = router;
