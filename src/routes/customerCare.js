const express = require("express");
const router = express.Router();

const {
  userContactUs,
  allContactUs,
  contactUsCompleted,
  sendContactUsFeedback,
  createBarberContact
} = require("../controllers/CustomerCareController/contactUs");

const {
  userHelpCenter,
  getAllHelpRequest,
  helpRequestCompleted,
  getHelpRequestByEcosystem,
  getCreatorHelpRequest,
  getAnEcosystemUserHelpRequest,
  creatorhelpCenterDashBoard,
  sendFeedback,
} = require("../controllers/CustomerCareController/helpCenter");
const {
  creatorSupport,
  getAllSupportRequest,
  supportRequestCompleted,
  getSupportRequestByACreator,
  sendSupportFeedback,
} = require("../controllers/CustomerCareController/support");

const {
  suggestFeatures,
  getAllFeatures,
  getACreatorFeature,
  featureDashboard,
} = require("../controllers/CustomerCareController/feature");

// contact section
router.post("/contact-us", userContactUs);
router.get("/all-contact-us", allContactUs);
router.put("/contact-us/:id/completed", contactUsCompleted);
router.post("/send-contact-us-feedback", sendContactUsFeedback);
router.post("/create-barber-contact", createBarberContact);

//End-Users Help center routes
router.post("/enduser-help-requests", userHelpCenter);
router.get("/all-enduser-help-requests", getAllHelpRequest);
router.put("/help-center/completed/:requestId", helpRequestCompleted);
router.get(
  "/help-request-by-ecosystem/:ecosystemDomain",
  getHelpRequestByEcosystem
);
router.get("/get-creator-help-request/:creatorId", getCreatorHelpRequest);
router.get(
  "/get-ecoysytem-user-help-request/:userId/:ecosystemDomain",
  getAnEcosystemUserHelpRequest
);
router.post("/help-request-feedback", sendFeedback);
router.get("/creator/my-help-request/:creatorId", creatorhelpCenterDashBoard);


//Creator Support routes
router.post("/creator-support", creatorSupport);
router.get("/all-creator-support-requests", getAllSupportRequest);
router.put(
  "/creator-support-request/completed/:requestId",
  supportRequestCompleted
);
router.get(
  "/support-request-by-a-creator/:creatorId",
  getSupportRequestByACreator
);
router.post("/creator-support-request-feedback", sendSupportFeedback);



//creator features suggestion
router.post("/creator-suggest-feature", suggestFeatures);
router.get("/all-creator-feature-suggestion", getAllFeatures);
router.get("/get-a-creator-feature/:creatorId", getACreatorFeature);
router.get("/creator/feature-dashboard/:creatorId", featureDashboard);

module.exports = router;
