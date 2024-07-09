const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");
const dimpifiedCourse = require("../../models/Course");
const Template = require("../../models/Templates");
const CreatorSupport = require("../../models/Support");


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

  const requiredFields = [
    "creatorId",
    "ecosystemName",
    "ecosystemDomain",
    "targetAudienceSector",
    "mainObjective",
    "expectedAudienceNumber",
    "experience",
    "ecosystemDescription",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  try {
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    let ecosystem;
    if (ecosystemId && ecosystemId !== "null") {
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

      if (!ecosystem) {
        return res.status(404).json({ message: "Ecosystem not found" });
      }
    } else {
      ecosystem = new Ecosystem({
        creatorId,
        ecosystemName,
        ecosystemDomain,
        targetAudienceSector,
        mainObjective,
        steps: 1,
        expectedAudienceNumber,
        experience,
        ecosystemDescription,
        status: "draft",
      });
      await ecosystem.save();
    }

    return res
      .status(201)
      .json({ message: "Ecosystem about information saved", ecosystem });
  } catch (error) {
    console.error("Error saving ecosystem about information:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Endpoint to handle ecosystem completion
const ecosystemDelete = async (req, res) => {
  const { ecosystemId } = req.body;

  try {
    const ecosystem = await Ecosystem.findById(ecosystemId);

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    ecosystem.status = "private";
    ecosystem.updatedAt = Date.now();
    await ecosystem.save();

    res.status(200).json({ message: "Ecosystem completed", ecosystem });
  } catch (error) {
    console.error("Error completing ecosystem:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

//Endpoint to get all courses for an ecosystem
const allEcosystemCourses = async (req, res) => {
  try {
    const ecosystemId = req.params.ecosystemId;
    if (!ecosystemId) {
      res.status(404).json({ message: "Ecosystem ID is required" });
    }

    const ecosystemCourses = await Ecosystem.findById(ecosystemId).populate(
      "courses"
    );

    if (!ecosystemCourses) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    res.status(200).json({ ecosystemCourses: ecosystemCourses.courses });
  } catch (error) {
    console.error("error retrieving all ecosystem courses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const getMyEcosystem = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(404).json({ message: "Ecosystem ID is required" });
    }
    const getEcosystem = await Ecosystem.find({ creatorId: userId }).sort({
      createdAt: -1,
    });
    const ecosystemLogo = await Promise.all(
      getEcosystem.map(async (ecosystem) => {
        const templates = await Template.find({
          _id: { $in: ecosystem.templates },
        });

        const templateLogos = templates.map((template) => ({
          templateId: template._id,
          templateNumber: template.templateNumber,
          logoPath: template.navbar.logo,
        }));
        return {
          ...ecosystem.toObject(),
          templateLogos,
        };
      })
    );
    return res.status(200).json({ ecosystem: ecosystemLogo });
  } catch (error) {
    console.error("error retrieving courses from ecosystem: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const creatorEcosystemDashboardOverview = async (req, res) => {
  const { creatorId } = req.params;

  if (!creatorId) {
    return res.status(400).json({ message: "creatorId is required" });
  }

  try {
    const totalEcosystems = await Ecosystem.countDocuments({
      creatorId: creatorId,
    });

    // Total users in ecosystems created by the creator
    const ecosystems = await Ecosystem.find({ creatorId: creatorId });
    const totalUsers = ecosystems.reduce(
      (acc, ecosystem) => acc + (ecosystem.users || 0),
      0
    );

    // Total support requests
    const totalSupportRequests = await CreatorSupport.count({
      where: { creatorId: creatorId },
    });

    res.status(200).json({
      totalEcosystems,
      totalUsers,
      totalSupportRequests,
    });
  } catch (error) {
    console.error("Error retrieving summary information:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const creatorEcosystemSummary = async (req, res) => {
  const { creatorId } = req.params;

  if (!creatorId) {
    return res.status(400).json({ message: "creatorId is required" });
  }

  try {
    const totalDrafts = await Ecosystem.countDocuments({
      creatorId: creatorId,
      status: "draft",
    });

    const totalPrivate = await Ecosystem.countDocuments({
      creatorId: creatorId,
      status: "private",
    });

    const totalLive = await Ecosystem.countDocuments({
      creatorId: creatorId,
      status: "live",
    });

    res.status(200).json({
      totalLive,
      totalPrivate,
      totalDrafts,
    });
  } catch (error) {
    console.error("Error retrieving ecosystem summary:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  aboutEcosystem,
  ecosystemDelete,
  allEcosystemCourses,
  
  getMyEcosystem,
  creatorEcosystemDashboardOverview,
  creatorEcosystemSummary,
};
