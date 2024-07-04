const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createForm,
  getFormById,
  allEcosystemForm,
} = require("../controllers/EcosystemController/createForm");

const uploadsPath = path.resolve(__dirname, "../uploads");
console.log("Uploads folder path:", uploadsPath);

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
    fileSize: 10 * 1024 * 1024,
  },
});

const imgUpload = upload.fields([
  { name: "sidebar.image", maxCount: 1 },
  { name: "logo.image", maxCount: 1 },
]);

router.post("/ecosystem/create-form", imgUpload, createForm);
router.get("/forms/:formId", getFormById);
router.get("/ecosystem/all-forms/:ecosystemId", allEcosystemForm);

module.exports = router;
