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
  getMyEcosystem,
  allEcosystemTemplates,
} = require("../controllers/EcosystemController/createEcosystem");


const multer = require("multer");
const createEcoCertificate = require("../controllers/EcosystemController/ecosystemCertificate");
const generateUserCertificate = require("../controllers/EcosystemController/enduserCertificate");

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post("/ecosystem/aboutDetails", aboutEcosystem);
// router.post("/ecosystem/template", ecosystemTemplate);
router.post("/ecosystem/form", ecosystemForm);
// router.post("/ecosystem/course", upload.single("image"), ecosystemCourse);
router.post("/ecosystem/integration", ecosystemIntegration);
router.post("/ecosystem/completed", ecosystemCompleted);

//Route to get all ecosystem courses
router.get("/ecosystem/get-all-courses/:ecosystemId", allEcosystemCourses);

//Route to get all ecosysten templates
router.get("/ecosystem/get-all-templates/:ecosystemId", allEcosystemTemplates);

//route to a particular course in the ecosystem
router.get("/ecosystem/:ecosystemId/:courseId", getAnEcosystemCourse);

// to get creator ecosystems
router.get("/creator-ecosystems/:userId", getMyEcosystem);

//To create ecosystem certificate
router.post("/create-ecosystem-certificate", upload.fields(['logo', 'image']), createEcoCertificate)

//To Create End-User Certificate
router.post("/generate-user-certificate", generateUserCertificate)

module.exports = router;
