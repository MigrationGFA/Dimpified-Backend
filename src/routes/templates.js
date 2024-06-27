const express = require("express");
const router = express.Router();
const createTemplates = require("../controllers/EcosystemController/createTemplate");
const multer = require("multer");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const imgUpload = upload.fields([
  { name: "navbarLogo", maxCount: 1 },
  { name: "heroBackgroundImage", maxCount: 1 },
  { name: "visionImage", maxCount: 1 },
  { name: "audienceImage1", maxCount: 1 },
  { name: "audienceImage2", maxCount: 1 },
  { name: "audienceImage3", maxCount: 1 },
  { name: "audienceImage4", maxCount: 1 },
  { name: "ctaImage", maxCount: 1 },
  { name: "footerLogo", maxCount: 1 },
]);

router.post("/ecosystem/create-templates", imgUpload, createTemplates);

module.exports = router;
