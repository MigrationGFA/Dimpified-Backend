const express = require("express");
const router = express.Router();

const { submitReview, getAllReviews } = require("../controllers/RatingController/rating");
const { suggestFeatures, getAllFeatures } = require("../controllers/CustomerCareController/feature");


//Creator review to admin
router.post('/submit-review', submitReview);
router.get('/all-reviews', getAllReviews);


//creator features suggestion
router.post('/creator-suggest-feature', suggestFeatures)
router.get('/all-creator-feature-suggestion', getAllFeatures)

module.exports = router