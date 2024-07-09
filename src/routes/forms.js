const express = require("express");
const router = express.Router();
const multer = require("multer");
<<<<<<< HEAD
const path = require("path");
=======
const {storageForm} = require("../helper/multerUpload")
>>>>>>> 0be413bde2124b65dde5e11c136a8d95b1c31466
const {
  createForm,
  getFormById,
  EcosystemForm,
} = require("../controllers/EcosystemController/createForm");

<<<<<<< HEAD
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
=======
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
>>>>>>> 0be413bde2124b65dde5e11c136a8d95b1c31466

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
