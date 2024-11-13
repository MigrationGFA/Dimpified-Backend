const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({});

const upload = multer({ storage });

const authController = require("../controllers/creatorController/authentication/Category1/registration");
const generalAuthService = require("../controllers/creatorController/authentication/generalAuth");
const {
  resetPasswordLimiter,
  authLimiter,
} = require("../middleware/RateLimter");

const auth = require("../controllers/affiliateController/Authentication/auth");
const refreshCreatorToken = require("../middleware/refreshCreatorToken");
// category 1 register endpoint
router.post("/creator/signup", authController.creatorSignup);
router.post("/creator/verify-otp", generalAuthService.verifyOTPCreator);

// general registration flow
router.post(
  "/creator/resend-otp",
  resetPasswordLimiter,
  generalAuthService.resendOTPCreator
);
router.post("/creator/sign-in", generalAuthService.creatorLogin);
router.post("/creator/forgot/password", generalAuthService.forgotPassword);
router.post(
  "/creator/resend-password-otp",
  resetPasswordLimiter,
  generalAuthService.resendPasswordResetOTP
);
router.post(
  "/creator/verify-reset-otp",
  generalAuthService.verifyResetPasswordOtp
);
router.patch(
  "/creator/reset/password",
  resetPasswordLimiter,
  generalAuthService.resetPassword
);
// Configure Multer for handling file uploads

router.patch(
  "/creator/update-profile-image",
  upload.single("image"), // 'image' is the field name in the form-data
  generalAuthService.updateCreatorImage
);

// get ecosystem

//Affiliate Authentication endpoints
router.post("/affiliate/signup", authLimiter, auth.affiliateSignup);
router.post("/affiliate/login", authLimiter, auth.affiliateLogin);
router.post(
  "/affiliate/resend-email",
  resetPasswordLimiter,
  auth.resendEmailAffiliate
);
router.post(
  "/affiliate/reset-password",
  resetPasswordLimiter,
  auth.resetPasswordAffiliate
);
router.post(
  "/affiliate/verify-email",
  resetPasswordLimiter,
  auth.verifyEmailAffiliate
);
router.post(
  "/affiliate/forgot-password",
  resetPasswordLimiter,
  auth.forgotPasswordAffiliate
);

//Get profile
router.post("/creator/refresh-token", refreshCreatorToken);

module.exports = router;
