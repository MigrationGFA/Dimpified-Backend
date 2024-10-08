const express = require("express");
const {
    getAdminDashboardEcosystemOverview,
    getAdminAllEcosystem,
    getPendingEcosystems,
    getCompletedEcosystems,
    getAdminLastFourEcosystems,
    getAdminLastFourProducts,
    getEcosystemSingle,
    getAllCreators,
    getACreatorById,
    getAdminLastFourCreators,
    getAdminDashboardCreatorOverview,
    getAllSupportRequests,
    getAdminDashboardSupportOverview,
    getAdminDashboardOverview,
    getAllFeatures,
    getAllReviews
} = require("../controllers/AdminController/adminDashboard.js/dashboard");
const router = express.Router();


//Admin ecosystem endpoints
router.get("/admin-all-ecosystems", getAdminAllEcosystem);
router.get("/admin-pending-ecosystems", getPendingEcosystems);
router.get("/admin-completed-ecosystems", getCompletedEcosystems);
router.get("/admin-last-four-ecosystems", getAdminLastFourEcosystems);
router.get("/admin-ecosystem-dashboard-overview", getAdminDashboardEcosystemOverview);
router.get("/admin-last-four-products", getAdminLastFourProducts);
router.get("/admin-get-an-ecosystem/:id", getEcosystemSingle,)

//Admin Creators endpoint
router.get("/admin-all-creators", getAllCreators);
router.get("/admin-get-a-creator/:id", getACreatorById);
router.get("/admin-last-four-creators", getAdminLastFourCreators);
router.get("/admin-creator-dashboard-overview", getAdminDashboardCreatorOverview)

//Admin creator support Requests
router.get("/admin-all-support-requests", getAllSupportRequests)
router.get("/admin-support-dashboard-overview", getAdminDashboardSupportOverview)

//Admin get all Features 
router.get("/admin-all-features", getAllFeatures)

//Admin get all reviews
router.get("/admin-all-reviews", getAllReviews)

//Dashboard data
router.get("/admin-dashboard-overview", getAdminDashboardOverview);




module.exports = router;