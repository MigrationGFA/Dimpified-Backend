const express = require("express");
const {
  affiliateSignup,
  affiliateLogin,
} = require("../controllers/AffiliateController/registration");
const router = express.Router();

router.post("/affiliate/signup", affiliateSignup);
router.post("/affiliate/login", affiliateLogin);

module.exports = router;
