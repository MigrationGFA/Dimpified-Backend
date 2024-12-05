const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController/dashboard");
const adminSubscriptionController = require("../controllers/AdminController/subscription");
const adminTransactionController = require("../controllers/AdminController/transaction");
// const authenticatedUser = require("../middleware/authentication");

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

  adminController.getAdminDashboardUsers
);
router.get(
  "/admin/all-subscribers",

  adminController.getAdminDashboardSubscribers
);
router.get(
  "/admin/all-users-informations",

  adminController.getAdminDashboardUsersInformations
);

router.get(
  "/admin/all-subscription",

  adminSubscriptionController.getAllSubscriptions
);

router.get(
  "/admin/total-subscriptions",

  adminSubscriptionController.getTotalSubscriptions
);

router.get(
  "/admin/subscriptions",

  adminSubscriptionController.getCalculatedTotalSubscriptions
);

router.get(
  "/admin/all-creator-withdrawals",

  adminTransactionController.getAllCreatorEarnings
);

router.get("/ecosystem-transactions", ecosystemTransactions);

router.get("/ecosystem-user-stats", userStats);

router.get(
  "/ecosystem-monthly-registration",

  monthlyRegistration
);

router.get("/ecosystem-supports-tickets", supportTickets);

router.get(
  "/ecosystem-subscription-plan-type-and-total-subscription",

  planTypeTotalSubscription
);

router.get(
  "/ecosystem-monthly-subscription",

  monthlySubscriptions
);

module.exports = router;
