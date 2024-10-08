const Ecosystem = require("../../../models/Ecosystem");
const Creator = require("../../../models/Creator");
const CreatorTemplate = require("../../../models/creatorTemplate");

const createNewTemplate = async (req, res) => {
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
    creator.step = 4
    await creator.save()
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
    createNewTemplate
}