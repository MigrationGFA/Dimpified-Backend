const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController/dashboard");
const adminSubscriptionController = require("../controllers/AdminController/subscription");
const adminTransactionController = require("../controllers/AdminController/transaction");
const authenticatedUser = require("../middleware/authentication");

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

router.get(
  "/admin/all-users",
  authenticatedUser,
  adminController.getAdminDashboardUsers
);
router.get(
  "/admin/all-subscribers",
  authenticatedUser,
  adminController.getAdminDashboardSubscribers
);
router.get(
  "/admin/all-users-informations",
  authenticatedUser,
  adminController.getAdminDashboardUsersInformations
);

router.get(
  "/admin/all-subscription",
  authenticatedUser,
  adminSubscriptionController.getAllSubscriptions
);

router.get(
  "/admin/total-subscriptions",
  authenticatedUser,
  adminSubscriptionController.getTotalSubscriptions
);

router.get(
  "/admin/subscriptions",
  authenticatedUser,
  adminSubscriptionController.getCalculatedTotalSubscriptions
);

router.get(
  "/admin/all-creator-withdrawals",
  authenticatedUser,
  adminTransactionController.getAllCreatorEarnings
);

router.get("/ecosystem-transactions", authenticatedUser, ecosystemTransactions);

router.get("/ecosystem-user-stats", authenticatedUser, userStats);

router.get(
  "/ecosystem-monthly-registration",
  authenticatedUser,
  monthlyRegistration
);

router.get("/ecosystem-supports-tickets", authenticatedUser, supportTickets);

router.get(
  "/ecosystem-subscription-plan-type-and-total-subscription",
  authenticatedUser,
  planTypeTotalSubscription
);

router.get(
  "/ecosystem-monthly-subscription",
  authenticatedUser,
  monthlySubscriptions
);

module.exports = router;
