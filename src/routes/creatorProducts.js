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
  editServiceDetailsAndAddService,
  editSubService,
} = require("../controllers/CreatorController/ProductsController/Service");
const {
  createDigitalProduct,
  getAllDigitalProducts,
  getADigitalProduct,
  getAllEcosystemDigitalProducts,
} = require("../controllers/CreatorController/ProductsController/digitalProduct");

const authenticatedUser = require("../middleware/authentication");

const upload = multer({
  storage: storageCourse,
  limits: {
    fileSize: 104857600, // 100MB
  },
});

const backgroundUpload = multer({
  storage: backgroundStorage,
  limits: {
    fileSize: 104857600, // 100MB
  },
});
// Course creation endpoint
router.post(
  "/create-course",
  authenticatedUser,
  upload.single("image"),
  createCourse
);
router.get("/ecosystem-courses/:ecosystemDomain", getEcosystemCourse);
router.get(
  "/ecosystem-single-course/:ecosystemDomain/:courseId",

  getAnEcosystemCourseDetails
);

// service creation endpoint
router.post("/create-service", authenticatedUser, createService);
router.put("/edit-service-details", editServiceDetailsAndAddService);
router.put("/edit-service", editSubService);

router.get("/get-all-services/:ecosystemDomain", getAllServices);
router.get("/get-a-service/:serviceId", getAService);

// digital product endpoints
router.post(
  "/create-digital-product",
  backgroundUpload.array("backgroundCover"),
  createDigitalProduct
);
router.get("/get-all-digital-products/:creatorId", getAllDigitalProducts);
router.get(
  "/get-all-ecosystem-digital-products/:ecosystemDomain",
  getAllEcosystemDigitalProducts
);
router.get("/digital-product/:digitalProductId", getADigitalProduct);

// creator overview dashboard

module.exports = router;
