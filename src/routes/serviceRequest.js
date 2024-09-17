const express = require("express");
const {
  createServiceRequest,
  getEcosystemServiceRequest,
  getEcosystemUserServiceRequets,
} = require("../controllers/EcosystemController/serviceRequest");
const router = express.Router();



router.post("/create-service-request", createServiceRequest);
router.get('/service-requests/:ecosystemDomain',getEcosystemServiceRequest)
router.get('/user-service-requests/:ecosystemUserId',getEcosystemUserServiceRequets)

module.exports = router;
