const express = require("express");
const router = express.Router();
const {
  createForm,
  getFormById,
} = require("../controllers/EcosystemController/createForm");

const { formUpload } = require("../utils/multerUpload");

const imgUpload = formUpload.fields([
  { name: "sidebar.image", maxCount: 1 },
  { name: "logo.image", maxCount: 1 },
]);

router.post("/ecosystem/create-form", imgUpload, createForm);
router.get("/forms/:formId", getFormById);

module.exports = router;
