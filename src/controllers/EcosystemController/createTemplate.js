const Template = require("../../models/Templates");
const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");
const EcosystemUser = require("../../models/EcosystemUser");
const Barbertemplate = require("../../models/AllTemplate/Barbertemplate");
const CreatorTemplate = require("../../models/creatorTemplate");

const createTemplate = async (req, res) => {
  try {
    const { creatorId, ecosystemId, templateNumber } = req.body;

    const details = ["creatorId", "ecosystemId", "templateNumber"];

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

    console.log("The error is here for the templateData");

    // Set file paths in templateData
    if (req.files) {
      if (req.files["navbar.logo"]) {
        templateData.navbar.logo = `https://dimpified-backend-development.azurewebsites.net/${req.files["navbar.logo"][0].path}`;
      }
      if (req.files["hero.backgroundImage"]) {
        templateData.hero.backgroundImage = `https://dimpified-backend-development.azurewebsites.net/${req.files["hero.backgroundImage"][0].path}`;
      }
      if (req.files["Vision.image"]) {
        templateData.vision.image = `https://dimpified-backend-development.azurewebsites.net/${req.files["Vision.image"][0].path}`;
      }
      if (req.files["Audience.image1"]) {
        templateData.audience.image1 = `https://dimpified-backend-development.azurewebsites.net/${req.files["Audience.image1"][0].path}`;
      }
      if (req.files["Audience.image2"]) {
        templateData.audience.image2 = `https://dimpified-backend-development.azurewebsites.net/${req.files["Audience.image2"][0].path}`;
      }
      if (req.files["Audience.image3"]) {
        templateData.audience.image3 = `https://dimpified-backend-development.azurewebsites.net/${req.files["Audience.image3"][0].path}`;
      }
      if (req.files["Audience.image4"]) {
        templateData.audience.image4 = `https://dimpified-backend-development.azurewebsites.net/${req.files["Audience.image4"][0].path}`;
      }
      if (req.files["CTA.image"]) {
        templateData.cta.image = `https://dimpified-backend-development.azurewebsites.net/${req.files["CTA.image"][0].path}`;
      }
      if (req.files["footer.logo"]) {
        templateData.footer.logo = `https://dimpified-backend-development.azurewebsites.net/${req.files["footer.logo"][0].path}`;
      }
    }

    const template = await Template.create(templateData);
    ecosystem.templates = template._id;

    // Set steps to 2
    ecosystem.steps = 2;
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
    const { ecosystemDomain } = req.params;
    if (!ecosystemDomain) {
      return res
        .status(400)
        .json({ message: "ecosystemDomain name  is required" });
    }

    const ecosystem = await Ecosystem.findOne({
      ecosystemDomain: ecosystemDomain,
    });

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const template = await CreatorTemplate.findOne({ ecosystemDomain: ecosystemDomain });
    console.log("this is template", template);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    return res.status(200).json({ templateDetails: template });
  } catch (error) {
    console.error("Error retrieving template from ecosystem: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createCreatorTemplate = async (req, res) => {
  try {
    const { creatorId, ecosystemDomain, templateId } = req.body;

    const requiredFields = ["creatorId", "ecosystemDomain", "templateId"];

    // Check if required fields are provided
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Check if the creator exists
    const creator = await Creator.findByPk(creatorId); // Assuming `Creator` is a Mongoose model
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    // Prepare the template data
    const templateData = {
      creatorId,
      ecosystemDomain,
      templateId,
      navbar: req.body.navbar,
      hero: req.body.hero,
      aboutUs: req.body.aboutUs,
      Vision: req.body.Vision,
      Statistics: req.body.Statistics,
      Patrners: req.body.Patrners,
      Events: req.body.Events,
      Gallery: req.body.Gallery,
      LargeCta: req.body.LargeCta,
      Team: req.body.Team,
      Blog: req.body.Blog,
      Reviews: req.body.Reviews,
      contactUs: req.body.contactUs,
      faq: req.body.faq,
      faqStyles: req.body.faqStyles,
      footer: req.body.footer,
    };

    // Create the template
    const template = await CreatorTemplate.create(templateData);

    // Update ecosystem with the new template
    ecosystem.steps = 2;
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

module.exports = {
  createTemplate,
  getAnEcosystemTemplate,
  createCreatorTemplate,
};
