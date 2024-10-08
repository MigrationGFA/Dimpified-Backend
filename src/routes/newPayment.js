const express = require("express");
const router = express.Router();
const {
  verifySubscription,
} = require("../controllers/newAddition/PaymentController/Subscription");

router.post("/payment/verify-subscription", verifySubscription);
module.exports = router;
