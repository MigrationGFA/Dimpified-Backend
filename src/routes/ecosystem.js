const express = require("express");
const router = express.Router();
const {
  aboutEcosystem,
 ecosystemDelete,
  allEcosystemCourses,
  getMyEcosystem,
  getAnEcosystemCourseDetails,
} = require("../controllers/EcosystemController/createEcosystem");


const multer = require("multer");
const createEcoCertificate = require("../controllers/EcosystemController/ecosystemCertificate");
const generateUserCertificate = require("../controllers/EcosystemController/enduserCertificate");

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({});
const upload = multer({ storage });

router.post("/ecosystem/aboutDetails", aboutEcosystem);
// router.post("/ecosystem/course", upload.single("image"), ecosystemCourse);
router.put("/ecosystem/delete", ecosystemDelete);

//Route to get all ecosystem courses
router.get("/ecosystem/get-all-courses/:ecosystemId", allEcosystemCourses);





// to get creator ecosystems
router.get("/creator-ecosystems/:userId", getMyEcosystem);

//To create ecosystem certificate
router.post("/create-ecosystem-certificate", upload.fields(['logo', 'image']), createEcoCertificate)

//To Create End-User Certificate
router.post("/generate-user-certificate", generateUserCertificate)

module.exports = router;
