const Creator = require("../../models/Creator");
const GeneralTemplate = require("../../models/Newtemplate");
const ReservedTemplate = require("../../models/ReservedTemplate");

const createReservedTemplate = async (req, res) => {
  try {
    if (!req.body.templateId) {
      return res.status(400).json({ message: "Please provide a TemplateId" });
    }

    const newTemplate = new ReservedTemplate(req.body);

    const savedTemplate = await newTemplate.save();

    res.status(201).json({
      message: "Template created successfully",
      data: savedTemplate, // Return the saved template (optional)
    });
  } catch (error) {
    console.error("Error creating template:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    } else if (error.code === 11000) {
      // Duplicate key error
      return res.status(409).json({ message: "Template already exists" });
    }

    res.status(500).json({ message: "Error creating template" });
  }
};

const getReservedTemplate = async (req, res) => {
  try {
    const { templateId } = req.params; // Extract templateId from the request parameters
    const template = await ReservedTemplate.findOne({ templateId });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({
      template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);

    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    res.status(500).json({ message: "Error fetching template" });
  }
};

const createGeneralTemplate = async (req, res) => {
  try {
    const requiredFields = ["subDomain", "creatorId", "templateId"];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
    const { creatorId, templateId } = req.body;
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Creator not found" });
    }

    const template = await GeneralTemplate.findOne({ templateId });
    if (template) {
      return res
        .status(400)
        .json({ message: `TemplateId ${templateId} is already taken` });
    }

    const newTemplate = new GeneralTemplate(req.body);

    const savedTemplate = await newTemplate.save();

    res.status(201).json({
      message: "Template created successfully",
      data: savedTemplate, // Return the saved template (optional)
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Error creating template" });
  }
};

const getGeneralTemplate = async (req, res) => {
  try {
    const { templateId } = req.params; // Extract templateId from the request parameters
    const template = await GeneralTemplate.findOne({ templateId });
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(200).json({
      template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);

    res.status(500).json({ message: "Error fetching template" });
  }
};

module.exports = {
  createReservedTemplate,
  getReservedTemplate,
  createGeneralTemplate,
  getGeneralTemplate,
};
