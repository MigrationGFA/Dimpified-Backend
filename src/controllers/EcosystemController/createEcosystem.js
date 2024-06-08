const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");

const aboutEcosystem = async (req, res) => {
  const {
    creatorId,
    ecosystemName,
    ecosystemDomain,
    targetAudienceSector,
    mainObjective,
    expectedAudienceNumber,
    experience,
    ecosystemDescription,
    ecosystemId,
  } = req.body;

  try {
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    let ecosystem;
    if (ecosystemId) {
      ecosystem = await Ecosystem.findByIdAndUpdate(
        ecosystemId,
        {
          creatorId,
          ecosystemName,
          ecosystemDomain,
          targetAudienceSector,
          mainObjective,
          expectedAudienceNumber,
          experience,
          ecosystemDescription,
          status: "draft",
          updatedAt: Date.now(),
        },
        { new: true }
      );
    } else {
      ecosystem = new Ecosystem({
        creatorId,
        ecosystemName,
        ecosystemDomain,
        targetAudienceSector,
        mainObjective,
        expectedAudienceNumber,
        experience,
        ecosystemDescription,
        status: "draft",
      });
      await ecosystem.save();
    }

    res
      .status(201)
      .json({ message: "Ecosystem about information saved", ecosystem });
  } catch (error) {
    console.error("Error saving ecosystem about information:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Endpoint to handle ecosystem template information
const ecosystemTemplate = async (req, res) => {
  const { ecosystemId, template } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        template,
        status: "draft",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Template saved", ecosystem });
  } catch (error) {
    console.error("Error saving template:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Endpoint to handle ecosystem form information
const ecosystemForm = async (req, res) => {
  const { ecosystemId, form } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        form,
        status: "draft",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Form saved", ecosystem });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Endpoint to handle ecosystem integration information
const ecosystemIntegration = async (req, res) => {
  const { ecosystemId, integration } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        integration,
        status: "draft",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Integration saved", ecosystem });
  } catch (error) {
    console.error("Error saving integration:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Endpoint to handle ecosystem completion
const ecosystemCompleted = async (req, res) => {
  const { ecosystemId } = req.body;

  try {
    const ecosystem = await Ecosystem.findById(ecosystemId);

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    // Check if all required fields are filled
    const requiredFields = [
      "ecosystemName",
      "ecosystemDomain",
      "targetAudienceSector",
      "mainObjective",
      "expectedAudienceNumber",
      "experience",
      "ecosystemDescription",
      "template",
      "form",
      "courses",
      "integration",
    ];

    for (const field of requiredFields) {
      if (
        !ecosystem[field] ||
        (Array.isArray(ecosystem[field]) && ecosystem[field].length === 0)
      ) {
        return res.status(400).json({
          message: `Field ${field} is required to complete the ecosystem`,
        });
      }
    }

    ecosystem.status = "completed";
    ecosystem.updatedAt = Date.now();
    await ecosystem.save();

    res.status(200).json({ message: "Ecosystem completed", ecosystem });
  } catch (error) {
    console.error("Error completing ecosystem:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  aboutEcosystem,
  ecosystemTemplate,
  ecosystemForm,
  ecosystemIntegration,
  ecosystemCompleted,
};
