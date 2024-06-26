const express = require("express");
const router = express.Router();
const createTemplates = require("../controllers/EcosystemController/createTemplate");

const upload = require("../utils/multerUpload");

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

router.post("/create-templates", imgUpload, createTemplates);

module.exports = router;
