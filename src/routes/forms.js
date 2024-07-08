const express = require("express");
const router = express.Router();
const multer = require("multer");
const {storageForm} = require("../helper/multerUpload")
const {
  createForm,
  getFormById,
  EcosystemForm,
} = require("../controllers/EcosystemController/createForm");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

const upload = multer({
  storage: storageForm,
  limits: {
    fileSize: 104857600 // 100MB
  }
});

const imgUpload = upload.fields([
  { name: "sidebar.image", maxCount: 1 },
  { name: "logo.image", maxCount: 1 },
]);

router.post("/ecosystem/create-form", imgUpload, createForm);
router.get("/get-forms/:formId", getFormById);
router.get("/ecosystem/forms/:ecosystemId", EcosystemForm);

module.exports = router;
