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

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const imgUpload = upload.fields([
  { name: "navbar.logo", maxCount: 1 },
  { name: "hero.backgroundImage", maxCount: 1 },
  { name: "Vision.image", maxCount: 1 },
  { name: "Audience.image1", maxCount: 1 },
  { name: "Audience.image2", maxCount: 1 },
  { name: "Audience.image3", maxCount: 1 },
  { name: "Audience.image4", maxCount: 1 },
  { name: "CTA.image", maxCount: 1 },
  { name: "footer.logo", maxCount: 1 },
]);

router.post("/ecosystem/create-templates", imgUpload, createTemplates);

module.exports = router;
