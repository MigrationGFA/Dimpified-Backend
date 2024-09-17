const express = require("express");
const {
  affiliateSignup,
  affiliateLogin,
  verifyEmailAffiliate,
  forgotPasswordAffiliate,
  resetPasswordAffiliate,
  affiliateLogOut,
  createAffiliateProfile,
} = require("../controllers/AffiliateController/registration");
const router = express.Router();
const multer = require("multer");
const authenticatedUser = require("../middleware/authentication");
const upload = multer({ dest: "uploads/" });

const {
    authLimiter,
    resetPasswordLimiter, 
} = require("../middleware/RateLimiter")

router.post("/affiliate/signup", authLimiter, affiliateSignup);
router.post("/affiliate/login", authLimiter, affiliateLogin);
router.post("/affiliate/verify-email",  resetPasswordLimiter,  verifyEmailAffiliate);
router.delete("/affiliate/logout/:userId", authenticatedUser, affiliateLogOut);
router.post("/affiliate/forgot-password",  resetPasswordLimiter,  forgotPasswordAffiliate);
router.post("/affiliate/reset-password",  resetPasswordLimiter,  resetPasswordAffiliate);
router.post(
  "/affiliate/profile",
  upload.single("image"),
  authenticatedUser,
  createAffiliateProfile
);

module.exports = router;
