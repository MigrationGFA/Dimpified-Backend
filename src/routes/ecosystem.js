const express = require("express");
const router = express.Router();
const {
  aboutEcosystem,
  ecosystemForm,
  ecosystemTemplate,
  ecosystemIntegration,
  ecosystemCompleted,
  allEcosystemCourses,
  getAnEcosystemCourse,
  getMyEcosystem
} = require("../controllers/EcosystemController/createEcosystem");

const multer = require("multer");

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post("/ecosystem/aboutDetails", aboutEcosystem);
router.post("/ecosystem/template", ecosystemTemplate);
router.post("/ecosystem/form", ecosystemForm);
// router.post("/ecosystem/course", upload.single("image"), ecosystemCourse);
router.post("/ecosystem/integration", ecosystemIntegration);
router.post("/ecosystem/completed", ecosystemCompleted);

//Route to get all ecosystem courses
router.get("/ecosystem/get-all-courses/:ecosystemId", allEcosystemCourses);

//route to a particular course in the ecosystem
router.get("/ecosystem/:ecosystemId/:courseId", getAnEcosystemCourse)

// to get creator ecosystems
router.get("/creator-ecosystems/:userId", getMyEcosystem)


module.exports = router;
