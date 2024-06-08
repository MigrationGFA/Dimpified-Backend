const express = require("express");
const router = express.Router();

const {
  userContactUs,
  allContactUs,
  contactUsCompleted,
} = require("../controllers/CustomerCareController/contactUs");

const { userHelpCenter, getAllHelpRequest, helpRequestCompleted, getHelpRequestByEcosystem } = require("../controllers/CustomerCareController/helpCenter");
const { creatorSupport, getAllSupportRequest, supportRequestCompleted, getSupportRequestByACreator } = require("../controllers/CustomerCareController/support");


router.post("/contact-us", userContactUs);
router.get("/all-contact-us", allContactUs);
router.put("/contact-us/:id/completed", contactUsCompleted);


//End-Users Help center routes
router.post('/enduser-help-requests', userHelpCenter)
router.get('/all-enduser-help-requests', getAllHelpRequest)
router.put("/help-center/completed/:requestId", helpRequestCompleted);
router.get("/help-request-by-ecosystem/:ecosystemId", getHelpRequestByEcosystem);

//Creator Support routes
router.post('/creator-support', creatorSupport);
router.get('/all-creator-support-requests', getAllSupportRequest)//getSupportRequestByACreator
router.put("/creator-support-request/completed/:requestId", supportRequestCompleted);
router.get('/support-request-by-a-creator/:creatorId', getSupportRequestByACreator)

module.exports = router;
