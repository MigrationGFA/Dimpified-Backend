const express = require("express");
const { createEcosystemUserResolution, getAllResolutionRequest, getMyResolutionRequest } = require("../controllers/CustomerCareController/Resolution");
const router = express.Router()

router.post("/create-resolution-request", createEcosystemUserResolution);
router.get("/all-resolution-requests", getAllResolutionRequest)
router.get("/my-resolution-request/:userId", getMyResolutionRequest)



module.exports = router