const express = require("express");
const router = express.Router();
const VerifyPayment = require("../controllers/PaymentController/payment");
const verifySubscription = require("../controllers/PaymentController/Subscription");
const {
  saveCreatorAccount,
  getCreatorBankDetails,
  editCreatorAccount,
  getCreatorEarning,
} = require("../controllers/PaymentController/AccountController");
const {
  withdrawalRequest,
  getWithdrawalRequests,
  getMyWithdrawalRequests,
} = require("../controllers/PaymentController/withdrawalController");

router.post("/verify-payment", VerifyPayment);
router.post("/verify-subscription", verifySubscription);

// Creator Payment Details
router.post("/save-bank-details", saveCreatorAccount);
router.get("/bank-details/:creatorId", getCreatorBankDetails);
router.put("/edit-account", editCreatorAccount);
router.get("/creator/earnings/:creatorId", getCreatorEarning);

//Withdrawal routes
router.post("/withdrawal-request", withdrawalRequest);
router.get("/get-withdrawal-requests", getWithdrawalRequests);
router.get("/get-my-withdrawal-requests/:creatorId", getMyWithdrawalRequests);

module.exports = router;
