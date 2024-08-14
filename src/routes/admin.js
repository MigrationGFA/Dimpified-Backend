const express = require("express");
const {
    getAdminDashboardEcosystemOverview,
    getAdminAllEcosystem,
    getPendingEcosystems,
    getCompletedEcosystems,
    getAdminLastFourEcosystems,
    getAdminLastFourProducts,
    getAllCreators,
    getACreatorById,
    getAdminLastFourCreators,
    getAdminDashboardCreatorOverview,
    getAllSupportRequests,
    getAdminDashboardSupportOverview,
    getAdminDashboardOverview } = require("../controllers/AdminController/adminDashboard.js/dashboard");
const router = express.Router();
const createDomain = require("../controllers/DomainController/Subdomain")


//Admin ecosystem endpoints
router.get("/admin-all-ecosystems", getAdminAllEcosystem);
router.get("/admin-pending-ecosystems", getPendingEcosystems);
router.get("/admin-completed-ecosystems", getCompletedEcosystems);
router.get("/admin-last-four-ecosystems", getAdminLastFourEcosystems);
router.get("/admin-ecosystem-dashboard-overview", getAdminDashboardEcosystemOverview);
router.get("/admin-last-four-products", getAdminLastFourProducts);

//Admin Creators endpoint
router.get("/admin-all-creators", getAllCreators);
router.get("/admin-get-a-creator/:id", getACreatorById);
router.get("/admin-last-four-creators", getAdminLastFourCreators);
router.get("/admin-creator-dashboard-overview", getAdminDashboardCreatorOverview)

//Admin creator support Requests
router.get("/admin-all-support-requests", getAllSupportRequests)
router.get("/admin-support-dashboard-overview", getAdminDashboardSupportOverview)

//Dashboard data
router.get("/admin-dashboard-overview", getAdminDashboardOverview);

router.post("/create-subdomain/:subdomain", createDomain)



module.exports = router;