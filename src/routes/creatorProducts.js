const express = require("express");
const router = express.Router();
const {
  createCourse,
  getEcosystemCourse,
  getAnEcosystemCourseDetails,
} = require("../controllers/CreatorController/ProductsController/course");
const { storageCourse, backgroundStorage } = require("../helper/multerUpload");
const multer = require("multer");
const {
  createService,
  getAllServices,
  getAService,
} = require("../controllers/CreatorController/ProductsController/Service");
const { createDigitalProduct, getAllDigitalProducts, getADigitalProduct } = require("../controllers/CreatorController/ProductsController/digitalProduct");

const upload = multer({
  storage: storageCourse,
  limits: {
    fileSize: 104857600, // 100MB
  },
});

const backgroundUpload = multer({ storage: backgroundStorage,  limits: {
    fileSize: 104857600, // 100MB
  }, });
// Course creation endpoint
router.post("/create-course", upload.single("image"), createCourse);
router.get("/ecosystem-courses/:ecosystemDomain", getEcosystemCourse);
router.get(
  "/ecosystem-single-course/:ecosystemDomain/:courseId",
  getAnEcosystemCourseDetails
);

// service creation endpoint
router.post(
  "/create-service",
  backgroundUpload.array("backgroundCover"),
  createService
);
router.get("/get-all-services/:ecosystemDomain", getAllServices);
router.get("/get-a-service/:serviceId", getAService);

// digital product endpoints
router.post("/create-digital-product",  backgroundUpload.array("backgroundCover"),createDigitalProduct)
router.get("/get-all-digital-products/:creatorId", getAllDigitalProducts);
router.get("/digital-product/:digitalProductId", getADigitalProduct);

// creator overview dashboard

module.exports = router;
