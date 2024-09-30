const express = require("express");
const {
  creatorSignup,
  verifyOTPCreator,
} = require("../controllers/newAddition/authentication/resgistration");
const router = express.Router();

router.post("/creator/signup", creatorSignup);
router.post("/creator/verify-otp",verifyOTPCreator)

module.exports = router