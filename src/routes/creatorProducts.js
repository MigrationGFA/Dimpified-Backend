const express = require("express");
const router = express.Router();
const {
  createCourse,
  getEcosystemCourse,
  singleCourse,
} = require("../controllers/CreatorController/ProductsController/course");
const { storageCourse, backgroundStorage } = require("../helper/multerUpload");
const multer = require("multer");
const {
  createService,
} = require("../controllers/CreatorController/ProductsController/Service");

const upload = multer({
  storage: storageCourse,
  limits: {
    fileSize: 104857600, // 100MB
  },
});

const backgroundUpload = multer({ storage: backgroundStorage });
// Course creation endpoint
router.post("/create-course", upload.single("image"), createCourse);
router.get("/ecosystem-courses/:ecosystemDomain", getEcosystemCourse);

// Get single Course
router.post("/ecosystem/:ecosystemDomain/course", singleCourse);

router.post(
  "/create-service",
  backgroundUpload.array("backgroundCover"),
  createService
);

module.exports = router;
