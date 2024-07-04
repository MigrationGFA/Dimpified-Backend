const express = require("express");
const router = express.Router();
const createTemplates = require("../controllers/EcosystemController/createTemplate");
const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024,
//   },
// });

const uploadsPath = path.resolve(__dirname, "../uploads");
// console.log("Uploads folder path:", uploadsPath);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
 limits: {
    fileSize: 104857600 // 100MB
  }
});

const imgUpload = upload.fields([
  { name: "navbar.logo", maxCount: 1 },
  { name: "hero.backgroundImage", maxCount: 1 },
  { name: "vision.image", maxCount: 1 },
  { name: "audience.image1", maxCount: 1 },
  { name: "audience.image2", maxCount: 1 },
  { name: "audience.image3", maxCount: 1 },
  { name: "audience.image4", maxCount: 1 },
  { name: "cta.image", maxCount: 1 },
  { name: "footer.logo", maxCount: 1 },
]);

router.post("/ecosystem/create-templates", imgUpload, createTemplates);

module.exports = router;
