const express = require("express");
const path = require("path")
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
// const storage = multer.diskStorage({});
// const upload = multer({ storage });

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // specify the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 104857600 // 100MB
  }
});


const cpUpload = upload.fields([
  { name: 'logoUrl', maxCount: 1 },
  { name: 'backgroundImageUrl', maxCount: 1 }
]);

router.post("/ecosystem/aboutDetails", aboutEcosystem);
// router.post("/ecosystem/course", upload.single("image"), ecosystemCourse);
router.put("/ecosystem/delete", ecosystemDelete);

//Route to get all ecosystem courses
router.get("/ecosystem/get-all-courses/:ecosystemId", allEcosystemCourses)


// to get creator ecosystems
router.get("/creator-ecosystems/:userId", getMyEcosystem);


//To create ecosystem certificate
router.post("/create-ecosystem-certificate", cpUpload, createEcoCertificate)

//To Create End-User Certificate
router.post("/generate-user-certificate", generateUserCertificate)

module.exports = router;
