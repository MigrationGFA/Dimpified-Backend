const express = require("express");
const router = express.Router();
const { storageTemplate } = require("../helper/multerUpload");

const {
  createTemplate,
  getAnEcosystemTemplate,
} = require("../controllers/EcosystemController/createTemplate");
const multer = require("multer");
const path = require("path");

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
  { name: "vision.image", maxCount: 1 },
  { name: "audience.image1", maxCount: 1 },
  { name: "audience.image2", maxCount: 1 },
  { name: "audience.image3", maxCount: 1 },
  { name: "audience.image4", maxCount: 1 },
  { name: "cta.image", maxCount: 1 },
  { name: "footer.logo", maxCount: 1 },
]);

// router.post("/ecosystem/create-templates", imgUpload, createTemplate);
router.post("/ecosystem/create-templates", (req, res, next) => {
  imgUpload(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).send(err.message);
    }
    console.log("Files received:", req.files);
    next();
  });
}, createTemplate);
router.get("/getTemplate/:ecosystemDomain", getAnEcosystemTemplate)

module.exports = router;
