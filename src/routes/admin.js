const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController/dashboard");
const adminSubscriptionController = require("../controllers/AdminController/subscription");
const adminTransactionController = require("../controllers/AdminController/transaction");
const adminUserBase = require("../controllers/AdminController/userBase");
const adminSubCategory = require("../controllers/AdminController/subCategory");
const withdrawalController = require("../controllers/AdminController/withdrawal");

// const authenticatedUser = require("../middleware/authentication");
const {
  getEcosystemData,
  upGradeUser,
} = require("../controllers/AdminController/access");

const adminSupportController = require("../controllers/AdminController/supportTicket");
const adminAuthController = require("../controllers/AdminController/authentication");
const verifyAdmin = require("../middleware/adminAuth");
const authenticatedAdmin = require("../middleware/adminAuthToken");
const adminNotificationController = require("../controllers/AdminController/notification");

const {
  monthlySubscriptions,
  planTypeTotalSubscription,
  getRevAndSubStat,
  getPlanTypeCount,
  getTotalSales,
} = require("../services/adminServices/subscription");
const {
  monthlyRegistration,
  userStats,
  getTotalSubscription,
  getTotalSubIncome
} = require("../services/adminServices/dashboard");
const { supportTickets } = require("../services/adminServices/supportTicket");
const {
  ecosystemTransactions,
} = require("../services/adminServices/transaction");
const { getUsersByPlan } = require("../services/adminServices/userBase");
const {
  getGMV,
  getNMV,
  getAmountPaid,
  getUnpaidAmount,
  getTransactionIncome,
  getTotalWithdrawals,
  getTransactions,
  getSubcriptionDetails,
  getcommissions,
  getWithdrawals,
} = require("../services/adminServices/finance");

const createSubdomain = require("../helper/Subdomain")

const {
  sendSubscriptionReminders
} = require("../helper/subscriptionHelper")

router.post("/test-reminder", sendSubscriptionReminders);
router.post("/create-subdomain/:subdomain", createSubdomain);

// registration
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
  "/admin/upgrade-user",

  upGradeUser
);

router.post(
  "/admin/verify-password",

  adminAuthController.verifyResetPasswordOtp
);

// admin dashboard
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
  "/user-information/:creatorId/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getAUserInformation
);

router.get(
  "/categories-count/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getAllCategory
);

router.get(
  "/stores-count/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getAllStores
);

router.get(
  "/ecosystem-subcategories/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminController.getTopStores
);

router.get(
  "/total-subscription/:email",
  verifyAdmin,
  authenticatedAdmin,
  getTotalSubscription
);

router.get(
  "/total-subscription-income/:email",
  verifyAdmin,
  authenticatedAdmin,
  getTotalSubIncome
);

// user base
router.get(
  "/store-by-country/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminUserBase.getStoreByCountry
);
router.post(
  "/store-by-state/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminUserBase.getStoreByCountryState
);
router.post(
  "/store-by-localGovernment/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminUserBase.getStoreByLocalGovernment
);

router.post(
  "/store-by-location/:email",
  verifyAdmin,
  authenticatedAdmin,
  adminUserBase.getStoreByLocation
);

router.get(
  "/store-by-date/:email/:date",
  verifyAdmin,
  authenticatedAdmin,
  adminUserBase.getStoreByDate
);

router.get(
  "/get-plan/:email/:plan",
  verifyAdmin,
  authenticatedAdmin,
  getUsersByPlan
);

// subCategory
router.get(
  "/get-a-subcategory/:email/:subcategory",
  verifyAdmin,
  authenticatedAdmin,
  adminSubCategory.getASubcategory
);

// subscribtion
router.get(
  "/admin/all-subscription/:email",
  verifyAdmin,
  // authenticatedAdmin,
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

router.get(
  "/total-revenue-sub/:email/:date",
  verifyAdmin,
  authenticatedAdmin,
  getRevAndSubStat
);
router.get(
  "/total-sales-record/:email/:date",
  verifyAdmin,
  authenticatedAdmin,
  getTotalSales
);

router.get(
  "/get-plan-stats/:email",
  verifyAdmin,
  authenticatedAdmin,
  getPlanTypeCount
);
// short access
router.get(
  "/ecosystem-monthly-data/:email",
   verifyAdmin,
  authenticatedAdmin,
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
   verifyAdmin,
  authenticatedAdmin,
  adminTransactionController.getendUserTransactionDetails
);

router.get(
  "/admin/subcategory-overview/:email",
   verifyAdmin,
  authenticatedAdmin,
  adminController.getAdminDashboardSubcategory
);

router.get(
  "/admin/subcategory-information/:email",
   verifyAdmin,
  authenticatedAdmin,
  adminController.getAdminDashboardSubcategoryInformation
);

router.post(
  "/admin/approve-withdrawal",
  authenticatedAdmin,
  withdrawalController.approveWithdrawalrequest
);

router.get("/admin/gmv/:email",
   verifyAdmin,
  authenticatedAdmin,
  getGMV);
router.get("/admin/nmv/:email",
   verifyAdmin,
  authenticatedAdmin,
  getNMV);
router.get("/admin/amount-paid/:email",
   verifyAdmin,
  authenticatedAdmin,
  getAmountPaid);
router.get("/admin/unpaid-amount/:email",
   verifyAdmin,
  authenticatedAdmin,
  getUnpaidAmount);
router.get("/admin/transaction-income/:email",
   verifyAdmin,
  authenticatedAdmin,
  getTransactionIncome);
router.get("/admin/total-withdrawals/:email",
   verifyAdmin,
  authenticatedAdmin,
  getTotalWithdrawals);
router.get("/admin/transactions/:email?",
   verifyAdmin,
  authenticatedAdmin,
  getTransactions);
router.get("/admin/subscription-details/:email",
   verifyAdmin,
  authenticatedAdmin,
  getSubcriptionDetails);
router.get("/admin/commissions/:email",
   verifyAdmin,
  authenticatedAdmin,
  getcommissions);
router.get("/admin/withdrawals/:status/:email",
   verifyAdmin,
  authenticatedAdmin,
  getWithdrawals);

module.exports = router;
