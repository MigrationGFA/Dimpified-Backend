const express = require("express");
const router = express.Router();
const creatorCourse = require("../controllers/CreatorController/CourseController/course");

const multer = require("multer");

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({});
const upload = multer({ storage });
// Course creation endpoint
router.post("/create-course", upload.single("image"), creatorCourse);

module.exports = router;
