const express = require("express");
const router = express.Router();
const {
  socialProfile,
  getSocial,
} = require("../controllers/SettingController/SocialProfile");
const DeleteAccount = require("../controllers/SettingController/DeleteAccount");

router.get("/get-social-profile/:userId", getSocial);
router.post("/update-social", socialProfile);

router.delete("/user/:userId", DeleteAccount);

module.exports = router;
