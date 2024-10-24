const express = require("express");
const router = express.Router();
const { storageTemplate } = require("../helper/multerUpload");

const {
  createTemplate,
  getAnEcosystemTemplate,
  createCreatorTemplate,
  editCreatorTemplate,
} = require("../controllers/EcosystemController/createTemplate");
const multer = require("multer");
const {
  createReservedTemplate,
  getReservedTemplate,
  createGeneralTemplate,
  getGeneralTemplate,
} = require("../controllers/EcosystemController/generalTemplate");

const {
  createNewTemplate,
} = require("../controllers/newAddition/Template/createTemplate");

const upload = multer({
  storage: storageTemplate,
  limits: {
    fileSize: 104857600,
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

// router.post("/ecosystem/create-templates", imgUpload, createTemplate);
router.post(
  "/ecosystem/create-templates",
  (req, res, next) => {
    imgUpload(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).send(err.message);
      }
      console.log("Files received:", req.files);
      next();
    });
  },
  createTemplate
);
router.get("/getTemplate/:ecosystemDomain", getAnEcosystemTemplate);

router.post("/ecosystem/create-creator-template", createCreatorTemplate);
router.post("/ecosystem/edit-creator-template/:ecosystemDomain", editCreatorTemplate);

router.post("/create/reserved-template", createReservedTemplate);
router.post("/create/general-template", createGeneralTemplate);
router.get("/reserved-template/:templateId", getReservedTemplate);
router.get("/general-template/:templateId", getGeneralTemplate);

// new edition
router.post("/create-template", createNewTemplate);

module.exports = router;
