const express = require("express");
const router = express.Router();

const {
  submitReview,
  getAllReviews,
  getReviewsByCreator,
} = require("../controllers/RatingController/rating");
const {
  suggestFeatures,
  getAllFeatures,
  getACreatorFeature,
  featureDashboard,
} = require("../controllers/CustomerCareController/feature");
const {
  createReviews,
  getReviews,
} = require("../controllers/RatingController/reviews");

//Creator review to admin
router.post("/creator-submit-review", submitReview);
router.get("/all-creator-reviews", getAllReviews);
router.get("/get-reviews-by-creator/:creatorId", getReviewsByCreator);

//creator features suggestion
router.post("/creator-suggest-feature", suggestFeatures);
router.get("/all-creator-feature-suggestion", getAllFeatures);
router.get("/get-a-creator-feature/:creatorId", getACreatorFeature);
router.get("/creator/feature-dashboard/:creatorId", featureDashboard);

// Ecosystem reviews
router.post("/ecosystem/create-reviews", createReviews);

module.exports = router;
