const express = require("express");
const router = express.Router();
const VerifyPayment = require("../controllers/PaymentController/payment");
const {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,
  getCreatorEarning,
} = require("../controllers/PaymentController/AccountController");
const {
  withdrawalRequest,
  getWithdrawalRequests,
} = require("../controllers/PaymentController/withdrawalController");

router.post("/verify-payment", VerifyPayment);

// Creator Payment Details
router.post("/save-bank-details", saveCreatorAccount);
router.get("/bank-details/:creatorId", getCreatorBankDetails);
router.put("/edit-account", editCreatorAccount);
router.get("/creator/earnings/:creatorId", getCreatorEarning);

//Withdrawal routes
router.post("/withdrawal-request", withdrawalRequest);
router.get("/get-withdrawal-requests", getWithdrawalRequests);
module.exports = router;
