const Template = require("../../models/Templates");
const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");

const createTemplate = async (req, res) => {
  try {
    const { creatorId, ecosystemId, templateNumber } = req.body;

   const details = [
            "creatorId",
            "ecosystemId",
            "templateNumber",
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const ecosystem = await Ecosystem.findById(ecosystemId);
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const templateData = {
      creatorId,
      ecosystemId,
      templateNumber,
      navbar: JSON.parse(req.body.navbar),
      hero: JSON.parse(req.body.hero),
      aboutUs: JSON.parse(req.body.aboutUs),
      vision: JSON.parse(req.body.vision),
      audience: JSON.parse(req.body.audience),
      cta: JSON.parse(req.body.cta),
      whyUs: JSON.parse(req.body.whyUs),
      contactUs: JSON.parse(req.body.contactUs),
      faq: JSON.parse(req.body.faq),
      footer: JSON.parse(req.body.footer),
    };

    // Set file paths in templateData
    if (req.files) {
      if (req.files["navbarLogo"]) {
        templateData.navbar.logo = req.files["navbarLogo"][0].path;
      }
      if (req.files["heroBackgroundImage"]) {
        templateData.hero.backgroundImage =
          req.files["heroBackgroundImage"][0].path;
      }
      if (req.files["visionImage"]) {
        templateData.vision.image = req.files["visionImage"][0].path;
      }
      if (req.files["audienceImage1"]) {
        templateData.audience.image1 = req.files["audienceImage1"][0].path;
      }
      if (req.files["audienceImage2"]) {
        templateData.audience.image2 = req.files["audienceImage2"][0].path;
      }
      if (req.files["audienceImage3"]) {
        templateData.audience.image3 = req.files["audienceImage3"][0].path;
      }
      if (req.files["audienceImage4"]) {
        templateData.audience.image4 = req.files["audienceImage4"][0].path;
      }
      if (req.files["ctaImage"]) {
        templateData.cta.image = req.files["ctaImage"][0].path;
      }
      if (req.files["footerLogo"]) {
        templateData.footer.logo = req.files["footerLogo"][0].path;
      }
    }

    const template = await Template.create(templateData);
    ecosystem.templates.push(template._id);
    await ecosystem.save();
    res
      .status(201)
      .json({ message: "Template created successfully", template });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = createTemplate;
