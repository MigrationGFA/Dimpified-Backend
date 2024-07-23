const express = require("express");
const router = express.Router();
const VerifyPayment = require("../controllers/PaymentController/payment");
const {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,
  getCreatorEarning,
} = require("../controllers/PaymentController/AccountController");

router.post("/verify-payment", VerifyPayment);

// Creator Payment Details
router.post("/save-bank-details", saveCreatorAccount);
router.get("/bank-details/:creatorId", getCreatorBankDetails);
router.put("/edit-account", editCreatorAccount);
router.get("/creator/earnings/:creatorId", getCreatorEarning);

module.exports = router;
