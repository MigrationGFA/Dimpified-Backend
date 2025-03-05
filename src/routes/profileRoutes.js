const express = require("express");
const router = express.Router();
const profileController = require("../controllers/creatorController/profile");
const authenticatedUser  = require("../middleware/authentication")

router.get("/creator/profile/:creatorId", 
    authenticatedUser,
    profileController.getProfileDetails);
router.patch("/creator/edit-profile", 
     authenticatedUser,
    profileController.editProfileDetails);

module.exports = router;
