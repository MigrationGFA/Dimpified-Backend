const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController/dashboard");
const adminSubscriptionController = require("../controllers/AdminController/subscription");
const adminTransactionController = require("../controllers/AdminController/transaction");

// const authenticatedUser = require("../middleware/authentication");
const { getEcosystemData } = require("../controllers/AdminController/access");

const adminSupportController = require("../controllers/AdminController/supportTicket");
const adminAuthController = require("../controllers/AdminController/authentication");
const verifyAdmin = require("../middleware/adminAuth");
const authenticatedAdmin = require("../middleware/adminAuthToken");
const adminNotificationController = require("../controllers/AdminController/notification");

const {
  monthlySubscriptions,
  planTypeTotalSubscription,
} = require("../services/adminServices/subscription");
const {
  monthlyRegistration,
  userStats,
} = require("../services/adminServices/dashboard");
const { supportTickets } = require("../services/adminServices/supportTicket");
const {
  ecosystemTransactions,
} = require("../services/adminServices/transaction");

router.post("/admin/registration", adminAuthController.adminRegister);
router.post("/admin/login", adminAuthController.adminLogin);
router.post(
  "/admin/forgot-password",

  adminAuthController.forgotPassword
);
router.post(
  "/admin/reset-password",

  adminAuthController.resetPassword
);
router.post(
  "/admin/resend-password",

  adminAuthController.resendPasswordResetOTP
);
router.post(
  "/admin/verify-password",

  adminAuthController.verifyResetPasswordOtp
);

router.get(
  "/admin/all-users/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getAdminDashboardUsers
);
router.get(
  "/admin/all-subscribers/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getAdminDashboardSubscribers
);
router.get(
  "/admin/all-users-informations/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getAdminDashboardUsersInformations
);

router.get(
  "/user-information/:creatorId",
  // verifyAdmin,
  // authenticatedAdmin,
  adminController.getAUserInformation
);

router.get(
  "/admin/all-subscription/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminSubscriptionController.getAllSubscriptions
);

router.get(
  "/admin/total-subscriptions/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminSubscriptionController.getTotalSubscriptions
);

router.get(
  "/admin/creator-withdrawal/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminTransactionController.getTransactionDetails
);

router.get(
  "/admin/subscriptions/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminSubscriptionController.getCalculatedTotalSubscriptions
);

router.get(
  "/admin/all-creator-withdrawals/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminTransactionController.getWithdrawalHistory
);

router.get(
  "/admin/withdrawal-details/:withdrawalId/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminTransactionController.getWithdrawalHistoryForProfile
);

router.get(
  "/ecosystem-transactions/:email",
  verifyAdmin,
  authenticatedAdmin,
  ecosystemTransactions
);

router.get(
  "/ecosystem-user-stats/:email",
  verifyAdmin,
  authenticatedAdmin,
  userStats
);

router.get(
  "/ecosystem-monthly-registration/:email",
  verifyAdmin,
  authenticatedAdmin,
  monthlyRegistration
);

router.get(
  "/ecosystem-supports-tickets/:email",
  verifyAdmin,
  authenticatedAdmin,
  supportTickets
);

router.get(
  "/admin/supports-information/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminSupportController.getSupportsInformation
);

router.get(
  "/admin/user-supports/:supportId/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminSupportController.getASupportsInformation
);

router.get(
  "/ecosystem-subscription-plan-type-and-total-subscription/:email",
  verifyAdmin,
  authenticatedAdmin,
  planTypeTotalSubscription
);

router.get(
  "/ecosystem-monthly-subscription/:email",
  verifyAdmin,
  authenticatedAdmin,
  monthlySubscriptions
);

// short access
router.get(
  "/ecosystem-monthly-data",

  getEcosystemData
);
router.get(
  "/admin-notification/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminNotificationController.getAdminNotifications
);

// router.get(
//   "/admin/withdrawal-details/:email",
//   adminTransactionController.getTransactionDetails
// );

router.get(
  "/admin/transaction-history/:email",
  adminTransactionController.getendUserTransactionDetails
);

router.get(
  "/admin/subcategory-overview",
  adminController.getAdminDashboardSubcategory
);

router.get(
  "/admin/subcategory-information",
  adminController.getAdminDashboardSubcategoryInformation
);

module.exports = router;
