const express = require("express");
const paymentController = require("../controllers/creatorController/Payment/Subscription");
const withdrawRequest = require("../controllers/creatorController/Payment/Withdrawal");
const bookingController = require("../controllers/creatorController/Payment/Features");
const router = express.Router();
const authenticatedUser  = require("../middleware/authentication")

router.post(
  "/payment/verify-subscription",
  paymentController.verifySubscription
);
router.post(
  "/payment/free-subscription",
  paymentController.createLiteSubscribtion
);

router.put(
  "/payment/update-subscription",
  paymentController.updateSubscription
);

router.post("/verify-booking-payment", bookingController.createBookingRecord);

router.get(
  "/get-withdrawal-requests/:ecosystemDomain",
  withdrawRequest.withdrawalRequest
);



module.exports = router;
