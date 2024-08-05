const express = require("express");
const {
    getAdminAllEcosystem,
    getPendingEcosystems,
    getCompletedEcosystems,
    getAllCreators,
    getACreatorById,
    getAllSupportRequests,
    getAdminDashboardOverview } = require("../controllers/AdminController/adminDashboard.js/dashboard");
const router = express.Router();


//Admin ecosystem endpoints
router.get("/admin-all-ecosystems", getAdminAllEcosystem);
router.get("/admin-pending-ecosystems", getPendingEcosystems);
router.get("/admin-completed-ecosystems", getCompletedEcosystems);

//Admin Creators endpoint
router.get("/admin-all-creators", getAllCreators)
router.get("/admin-get-a-creator/:id", getACreatorById)

//Admin creator support Requests
router.get("/admin-all-support-requests", getAllSupportRequests)

//Dashboard data
router.get("/admin-dashboard-overview", getAdminDashboardOverview)

module.exports = router;