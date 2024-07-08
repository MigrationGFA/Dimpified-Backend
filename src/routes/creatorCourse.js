const express = require("express");
const router = express.Router();
const creatorCourse = require("../controllers/CreatorController/CourseController/course");
const storage = require("../uploads/multerUpload")
const multer = require("multer");
// const path = require('path');
// const fs = require('fs');

// const storage = multer.diskStorage({});
// const upload = multer({ storage });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/Courses");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join( '..', 'uploads', 'Courses');

//     // Check if the directory structure exists. If not, create it recursively.
//     fs.access(uploadPath, fs.constants.F_OK, (err) => {
//       if (err) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//       }
//       cb(null, uploadPath);
//     });
//   },
//   filename: (req, file, cb) => {
//     // Generate a unique filename to prevent conflicts
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });


const upload = multer({
  storage: storage,
 limits: {
    fileSize: 104857600 // 100MB
  }
});
// Course creation endpoint
router.post("/create-course", upload.single("image"), creatorCourse);

module.exports = router;
