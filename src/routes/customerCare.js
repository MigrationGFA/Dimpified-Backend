const express = require("express");
const router = express.Router();

const {
  userContactUs,
  allContactUs,
  contactUsCompleted,
} = require("../controllers/CustomerCareController/contactUs");

const { userHelpCenter, getAllHelpRequest, helpRequestCompleted, getHelpRequestByEcosystem, sendFeedback } = require("../controllers/CustomerCareController/helpCenter");
const { creatorSupport, getAllSupportRequest, supportRequestCompleted, getSupportRequestByACreator, sendSupportFeedback } = require("../controllers/CustomerCareController/support");


router.post("/contact-us", userContactUs);
router.get("/all-contact-us", allContactUs);
router.put("/contact-us/:id/completed", contactUsCompleted);


//End-Users Help center routes
router.post('/enduser-help-requests', userHelpCenter);
router.get('/all-enduser-help-requests', getAllHelpRequest);
router.put("/help-center/completed/:requestId", helpRequestCompleted);
router.get("/help-request-by-ecosystem/:ecosystemId", getHelpRequestByEcosystem);
router.post("/help-request-feedback", sendFeedback);

//Creator Support routes
router.post('/creator-support', creatorSupport);
router.get('/all-creator-support-requests', getAllSupportRequest);
router.put("/creator-support-request/completed/:requestId", supportRequestCompleted);
router.get('/support-request-by-a-creator/:creatorId', getSupportRequestByACreator);
router.post("/creator-support-request-feedback", sendSupportFeedback);

module.exports = router;
