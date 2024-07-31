const express = require("express");
const { getAdminAllEcosystem, getPendingEcosystems, getCompletedEcosystems, getAllCreators, getAllSupportRequests } = require("../controllers/AdminController/adminDashboard.js/dashboard");
const router = express.Router();


//Admin ecosystem endpoints
router.get("/admin-all-ecosystems", getAdminAllEcosystem);
router.get("/admin-pending-ecosystems", getPendingEcosystems);
router.get("/admin-completed-ecosystems", getCompletedEcosystems);

//Admin Creators endpoint
router.get("/admin-all-creators", getAllCreators)

//Admin creator support Requests
router.get("/admin-all-support-requests", getAllSupportRequests)

module.exports = router;