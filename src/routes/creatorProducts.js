const express = require("express");
const router = express.Router();
const {createCourse, getEcosystemCourse} = require("../controllers/CreatorController/ProductsController/course");
const {storageCourse} = require("../helper/multerUpload")
const multer = require("multer");



const upload = multer({
  storage: storageCourse,
 limits: {
    fileSize: 104857600 // 100MB
  }
});
// Course creation endpoint
router.post("/create-course", upload.single("image"), createCourse);
router.get("/ecosystem-courses/:ecosystemDomain", getEcosystemCourse)

module.exports = router;
