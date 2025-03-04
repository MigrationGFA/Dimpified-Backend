const express = require("express");
const path = require("path");
const router = express.Router();
const ecosystemController = require("../controllers/creatorController/Ecosystem/businessDetails");
const bookingController = require("../controllers/creatorController/Ecosystem/booking");
const SupportController = require("../controllers/creatorController/Ecosystem/Supports");
const authenticatedUser = require("../middleware/authentication");

// create about ecosystem
router.post(
  "/creator/business-details",
  authenticatedUser,
  ecosystemController.createBusinessDetails
);

// get ecosystem
router.get(
  "/get-business-info/:creatorId",
  ecosystemController.getAboutEcosystem
);
// get ecosystem
router.get(
  "/website-details/:ecosystemDomain",
  ecosystemController.websiteDetails
);
//update ecosystem status
router.put(
  "/update-ecosystem-status",
  ecosystemController.updateEcosystemStatus
);

router.get(
  "/booking-overview/:ecosystemDomain",
  authenticatedUser,
  bookingController.bookingOverview
);

router.get(
  "/booking-stats/:ecosystemDomain",
  authenticatedUser,
  bookingController.weeklyBookingStats
);

router.get(
  "/bookings-per-date/:ecosystemDomain/:date",
  authenticatedUser,
  bookingController.getBookingByDate
);

router.post("/create-booking", bookingController.createBooking);

router.get(
  "/monthly-booking-stats/:ecosystemDomain",
  authenticatedUser,
  bookingController.monthlyBookingStats
);

router.get(
  "/get-appointments/:email/:ecosystemDomain",
  // authenticatedUser,
  bookingController.getCustomerAppointments
);

router.post("/check-domain", ecosystemController.checkDomainAvailability);
router.post("/ecosysystem-near-me", ecosystemController.getEcosystemNearMe);
// Support Request
router.post(
  "/creator-support",
  authenticatedUser,
  SupportController.creatorSupports
);

router.get(
  "/all-creator-support-requests/:ecosystemDomain",
  authenticatedUser,
  SupportController.getAllCreatorSupportsRequest
);

router.get(
  "/support-request-by-a-creator/:ecosystemDomain",
  authenticatedUser,
  SupportController.getSupportRequestByDomain
);

// Withdrawal Request

router.post(
  "/withdrawal-request",
  authenticatedUser,
  ecosystemController.makeWithdrawalRequest
);

router.get(
  "/get-withdrawal-requests/:ecosystemDomain",
  authenticatedUser,
  ecosystemController.getWithdrawalRequests
);

router.get(
  "/total-withdrawals-stats/:ecosystemDomain",
  authenticatedUser,
  ecosystemController.totalWithdrawalStats
);

// Notifications
router.put(
  "/marked-as-read/:ecosystemDomain/:notificationId",
  authenticatedUser,
  ecosystemController.markNotificationAsViewed
);

// GET a notification
router.get(
  "/notifications/:ecosystemDomain",
  authenticatedUser,
  ecosystemController.getNotification
);
router.get(
  "/customers/:ecosystemDomain",
  authenticatedUser,
  ecosystemController.getMerchantCustomers
);
router.post(
  "/add-customer",
  authenticatedUser,
  ecosystemController.addCustomer
);
router.delete(
  "/delete-customer",
  authenticatedUser,
  ecosystemController.deleteCustomer
);
router.patch(
  "/update-customer",
  authenticatedUser,
  ecosystemController.editCustomerDetails
);
router.get(
  "/customer-details/:customerId",
  authenticatedUser,
  ecosystemController.getCustomerDetails
);

router.patch(
  "/complete-booking/:bookingId",
  authenticatedUser,
  bookingController.completeBooking
);

// Dimp Contact US
router.post("/make-an-enquiry", SupportController.dimpContactUs);

module.exports = router;
