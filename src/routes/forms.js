const express = require("express");
const router = express.Router();
const {
  createForm,
  getFormById,
  allEcosystemForm,
} = require("../controllers/EcosystemController/createForm");

const { formUpload } = require("../utils/multerUpload");

const imgUpload = formUpload.fields([
  { name: "sidebar.image", maxCount: 1 },
  { name: "logo.image", maxCount: 1 },
]);

router.post("/ecosystem/create-form", imgUpload, createForm);
router.get("/forms/:formId", getFormById);
router.get("/ecosystem/all-forms/:ecosystemId", allEcosystemForm);

module.exports = router;
