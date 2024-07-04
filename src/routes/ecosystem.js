const express = require("express");
const router = express.Router();
const {
  aboutEcosystem,
  ecosystemIntegration,
  allEcosystemCourses,
  getAnEcosystemCourse,
  getMyEcosystem,
  allEcosystemTemplates,
  creatorEcosystemDashboardOverview,
  creatorEcosystemSummary,
} = require("../controllers/EcosystemController/createEcosystem");

const multer = require("multer");

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post("/ecosystem/aboutDetails", aboutEcosystem);

// router.post("/ecosystem/course", upload.single("image"), ecosystemCourse);
router.post("/ecosystem/integration", ecosystemIntegration);

//Route to get all ecosystem courses
router.get("/ecosystem/get-all-courses/:ecosystemId", allEcosystemCourses);

//Route to get all ecosystem templates
router.get("/ecosystem/get-all-templates/:ecosystemId", allEcosystemTemplates);

//route to a particular course in the ecosystem
router.get("/ecosystem/:ecosystemId/:courseId", getAnEcosystemCourse);

// to get creator ecosystems
router.get("/creator-ecosystems/:userId", getMyEcosystem);

// to get all the Dashboard stats
router.get("/creator/my-dashboard-overview", creatorEcosystemDashboardOverview);

// to get he creator ecosystem summary

router.get("/creator/my-ecosystem-summary", creatorEcosystemSummary);

module.exports = router;
