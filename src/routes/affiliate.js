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

router.post("/affiliate/signup", affiliateSignup);
router.post("/affiliate/login", affiliateLogin);
router.post("/affiliate/verify-email", verifyEmailAffiliate);
router.delete("/affiliate/logout/:userId", authenticatedUser, affiliateLogOut);
router.post("/affiliate/forgot-password", forgotPasswordAffiliate);
router.post("/affiliate/reset-password", resetPasswordAffiliate);
router.post(
  "/affiliate/profile",
  upload.single("image"),
  authenticatedUser,
  createAffiliateProfile
);

module.exports = router;
