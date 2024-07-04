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

module.exports = router;
