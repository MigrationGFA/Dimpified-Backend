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
        formData.sidebar.image = `https://dimpified-backend-development.azurewebsites.net/${sidebarImage.path}`;
      }
      if (req.files["logo.image"]) {
        const logoImage = req.files["logo.image"][0];
        if (!isValidFile(logoImage)) {
          return res.status(400).json({ message: "Invalid logo image file" });
        }
        formData.logo.image = `https://dimpified-backend-development.azurewebsites.net/${logoImage.path}`;
      }
    }

    const form = await Form.create(formData);
    ecosystem.forms = form._id;
    await ecosystem.save();

    res.status(201).json({ message: "Form created successfully", form });
  } catch (error) {
    console.error("Error creating form:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const ecosystemForm = async (req, res) => {
  try {
    const ecosystemDomain = req.params.ecosystemDomain;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "ecosystemDomain is required" });
    }

    const ecosystem = await Ecosystem.findOne({ecosystemDomain: ecosystemDomain});

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem  not found" });
    }

    const form = await Form.findById(ecosystem.forms);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({formDetails: form });
  } catch (error) {
    console.error("Error retrieving form:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// const EcosystemForm = async (req, res) => {
//   try {
//     const { ecosystemId } = req.params;

//     if (!ecosystemId) {
//       return res.status(400).json({ message: "Ecosystem ID is required" });
//     }

//     const ecosystem = await Ecosystem.findById(ecosystemId).populate("forms");

//     if (!ecosystem) {
//       return res.status(404).json({ message: "Ecosystem not found" });
//     }

//     res.status(200).json({ ecosystemForms: ecosystem.forms });
//   } catch (error) {
//     console.error("Error retrieving all ecosystem templates:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

module.exports = { createForm, ecosystemForm };
