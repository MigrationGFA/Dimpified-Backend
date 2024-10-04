const express = require("express");
const {
  creatorSignup,
  verifyOTPCreator,
  getCreators,
  createBusinessDetails
} = require("../controllers/newAddition/authentication/resgistration");
const router = express.Router();

router.post("/creator/signup", creatorSignup);
router.post("/creator/verify-otp", verifyOTPCreator);
router.post("/creator/business-details", createBusinessDetails);
router.get("/all-creators", getCreators);

module.exports = router;
