const express = require("express");
const router = express.Router();
const multer = require("multer");
const {storageForm} = require("../helper/multerUpload")
const {
  createForm,
  ecosystemForm
  // EcosystemForm,
} = require("../controllers/EcosystemController/createForm");



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
router.get("/ecosytemForm-forms/:ecosystemDomain", ecosystemForm);
// router.get("/ecosystem/forms/:ecosystemId", EcosystemForm);

module.exports = router;
