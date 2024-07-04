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

    console.log("i can see this part first")
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
    console.log("the error is here for the templateDate")

    // Set file paths in templateData
    if (req.files) {
      if (req.files["navbar.logo"]) {
        templateData.navbar.logo = req.files["navbar.logo"][0].path;
      }
      if (req.files["hero.backgroundImage"]) {
        templateData.hero.backgroundImage =
          req.files["hero.backgroundImage"][0].path;
      }
      if (req.files["Vision.image"]) {
        templateData.vision.image = req.files["Vision.image"][0].path;
      }
      if (req.files["Audience.image1"]) {
        templateData.audience.image1 = req.files["Audience.image1"][0].path;
      }
      if (req.files["Audience.image2"]) {
        templateData.audience.image2 = req.files["Audience.image2"][0].path;
      }
      if (req.files["Audience.image3"]) {
        templateData.audience.image3 = req.files["Audience.image3"][0].path;
      }
      if (req.files["Audience.image4"]) {
        templateData.audience.image4 = req.files["Audience.image4"][0].path;
      }
      if (req.files["CTA.image"]) {
        templateData.cta.image =req.files["CTA.image"][0].path;
      }
      if (req.files["footer.logo"]) {
        templateData.footer.logo = req.files["footer.logo"][0].path;
      }
    }

    const template = await Template.create(templateData);
    ecosystem.templates = template._id;
    await ecosystem.save();
    res
      .status(201)
      .json({ message: "Template created successfully", template });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getAnEcosystemTemplate = async (req, res) => {
  try {
    const { ecosystemName, } = req.params;
    if (!ecosystemName ) {
      return res
        .status(400)
        .json({ message: "Ecosystem name  is required" });
    }

    const ecosystem = await Ecosystem.findOne({ecosystemName: ecosystemName});

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    console.log("this is eco", ecosystem)

    console.log("this is eco TEMPLATE ", ecosystem.templates)
    
    const template = await Template.findOne({_id: ecosystem.templates});
    console.log("this is template", template)

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ templateDetails: template });
  } catch (error) {
    console.error("Error retrieving template from ecosystem: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {createTemplate, getAnEcosystemTemplate};
