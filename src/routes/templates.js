const express = require("express");
const router = express.Router();
const { storageTemplate } = require("../helper/multerUpload");

const {
  createTemplate,
  getAnEcosystemTemplate,
  createBarberTemplate,
} = require("../controllers/EcosystemController/createTemplate");
const multer = require("multer");
const {
  createReservedTemplate,
  getReservedTemplate,
} = require("../controllers/EcosystemController/generalTemplate");

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

const barberImgUpload = upload.fields([
  { name: "navbar.logo", maxCount: 1 },
  { name: "aboutSection.images", maxCount: 4 },
  { name: "heroSection.backgroundImage", maxCount: 1 },
  { name: "carouselImages", maxCount: 5 },
  { name: "footer.logo", maxCount: 1 },
  { name: "team.images", maxCount: 10 },
]);

router.post(
  "/ecosystem/create-barber-template",
  (req, res, next) => {
    barberImgUpload(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(400).send(err.message);
      }
      console.log("Files received:", req.files);
      next();
    });
  },
  createBarberTemplate
);

router.post("/create/reserved-template", createReservedTemplate);
router.get("/reserved-template/:templateId", getReservedTemplate);

module.exports = router;
