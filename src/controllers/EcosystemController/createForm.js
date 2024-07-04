const Form = require("../../models/Form");
const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");
const { isValidFile } = require("../../utils/multerUpload");

const createForm = async (req, res) => {
  try {
    const { creatorId, ecosystemId } = req.body;

    if (!creatorId || !ecosystemId) {
      return res
        .status(400)
        .json({ message: "creatorId and ecosystemId are required" });
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const ecosystem = await Ecosystem.findById(ecosystemId);
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const formData = {
      creatorId,
      ecosystemId,
      sidebar: JSON.parse(req.body.sidebar),
      logo: JSON.parse(req.body.logo),
      Page1: JSON.parse(req.body.Page1),
      Page2: JSON.parse(req.body.Page2),
      Page3: JSON.parse(req.body.Page3),
    };

    // Set file paths in formData
    if (req.files) {
      if (req.files["sidebar.image"]) {
        const sidebarImage = req.files["sidebar.image"][0];
        if (!isValidFile(sidebarImage)) {
          return res
            .status(400)
            .json({ message: "Invalid sidebar image file" });
        }
        formData.sidebar.image = sidebarImage.path;
      }
      if (req.files["logo.image"]) {
        const logoImage = req.files["logo.image"][0];
        if (!isValidFile(logoImage)) {
          return res.status(400).json({ message: "Invalid logo image file" });
        }
        formData.logo.image = logoImage.path;
      }
    }

    const form = await Form.create(formData);
    ecosystem.forms.push(form._id);

    // Set steps to 3
    ecosystem.steps = 3;

    await ecosystem.save();

    res.status(201).json({ message: "Form created successfully", form });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getFormById = async (req, res) => {
  try {
    const formId = req.params.formId;

    if (!formId) {
      return res.status(400).json({ message: "Form ID is required" });
    }

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({ form });
  } catch (error) {
    console.error("Error retrieving form:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const allEcosystemForm = async (req, res) => {
  try {
    const { ecosystemId } = req.params;

    if (!ecosystemId) {
      return res.status(400).json({ message: "Ecosystem ID is required" });
    }

    const ecosystem = await Ecosystem.findById(ecosystemId).populate("forms");

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    res.status(200).json({ ecosystemForms: ecosystem.forms });
  } catch (error) {
    console.error("Error retrieving all ecosystem templates:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createForm, getFormById, allEcosystemForm };
