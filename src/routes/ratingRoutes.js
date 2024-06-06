const express = require("express");
const router = express.Router();

const { submitReview, getAllReviews, getReviewsByCreator } = require("../controllers/RatingController/rating");
const { suggestFeatures, getAllFeatures } = require("../controllers/CustomerCareController/feature");


//Creator review to admin
router.post('/creator-submit-review', submitReview);
router.get('/all-creator-reviews', getAllReviews);
router.get('/get-reviews-by-creator/:creatorId', getReviewsByCreator);


//creator features suggestion
router.post('/creator-suggest-feature', suggestFeatures)
router.get('/all-creator-feature-suggestion', getAllFeatures)

module.exports = router