const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");
const dimpifiedCourse = require("../../models/Course");
const Template = require("../../models/Templates");
const CreatorSupport = require("../../models/Support");
const PurchasedItem = require("../../models/PurchasedItem");
const { Op } = require("sequelize");
const createSubdomain = require("../DomainController/Subdomain.js");
const ReservedTemplate = require("../../models/ReservedTemplate.js");
const CreatorTemplate = require("../../models/creatorTemplate.js");

const aboutEcosystem = async (req, res) => {
  const {
    creatorId,
    ecosystemName,
    ecosystemDomain,
    targetAudienceSector,
    mainObjective,
    contact,
    address,
    ecosystemDescription,
    ecosystemId,
    socialMedia,
  } = req.body;

  const requiredFields = [
    "creatorId",
    "ecosystemName",
    "ecosystemDomain",
    "targetAudienceSector",
    "mainObjective",
    "contact",
    "address",
    "ecosystemDescription",
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  // creator
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
          mainObjective,
          contact,
          targetAudienceSector,
          address,
          ecosystemDescription,
          socialMedia,
          status: "draft",
          updatedAt: Date.now(),
        },
        { new: true }
      );

      if (!ecosystem) {
        return res.status(404).json({ message: "Ecosystem not found" });
      }
    } else {
      
      const result = await createSubdomain(ecosystemDomain);
      if (result === "Subdomain creation successful") {
        ecosystem = new Ecosystem({
          creatorId,
          ecosystemName,
          ecosystemDomain,
          contact,
          mainObjective,
          steps: 1,
          targetAudienceSector,
          address,
          ecosystemDescription,
          socialMedia,
          status: "draft",
        });
        await ecosystem.save();
        return res
          .status(201)
          .json({ message: "Ecosystem about information saved", ecosystem });
      } else {
        return res.status(201).json({ message: "Domain creation falied" });
      }
    }
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
      res.status(400).json({ message: "Ecosystem ID is required" });
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
      return res.status(400).json({ message: "Ecosystem ID is required" });
    }
    const getEcosystem = await Ecosystem.find({ creatorId: userId }).sort({
      createdAt: -1,
    });
    //console.log("ecosystems:",getEcosystem)
    const ecosystemLogo = await Promise.all(
      getEcosystem.map(async (ecosystem) => {
        const templates = await CreatorTemplate.find({
          _id: { $in: ecosystem.templates },
        });
        //console.log("templsted:",templates)
        const templateLogos = templates.map((template) => ({
          templateId: template._id,
          templateNumber: template.templateId,
          logoPath: template.navbar.logo,
          barndPath: template.navbar.brand,
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
    // Total ecosystems created by the creator
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

    // Get ecosystem domains created by the creator
    const ecosystemDomains = ecosystems.map((e) => e.ecosystemDomain);

    // Total paid users
    const totalPaidUsers = await PurchasedItem.count({
      distinct: true,
      col: "userId",
      where: {
        ecosystemDomain: {
          [Op.in]: ecosystemDomains,
        },
      },
    });

    res.status(200).json({
      totalEcosystems,
      totalUsers,
      totalSupportRequests,
      totalPaidUsers,
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
    const ecosystems = await Ecosystem.find({ creatorId: creatorId });
    const totalUsers = ecosystems.reduce(
      (acc, ecosystem) => acc + (ecosystem.users || 0),
      0
    );

    res.status(200).json({
      totalLive,
      totalPrivate,
      totalDrafts,
      totalUsers,
    });
  } catch (error) {
    console.error("Error retrieving ecosystem summary:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getAboutEcosystem = async ( req, res) => {
  const { creatorId } = req.params;

  if (!creatorId) {
    return res.status(400).json({ message: "creatorId is required" });
  }
  try {
    const getEcosystem = await Ecosystem.findOne({
      creatorId: creatorId
    })
    if(!getEcosystem){
      return res.status(200).json({
     message: "business info not found"
    });
    }
    res.status(200).json({
      getEcosystem
    });
  } catch (error) {
     console.error("Error retrieving ecosystem summary:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
}

module.exports = {
  aboutEcosystem,
  ecosystemDelete,
  allEcosystemCourses,
  getMyEcosystem,
  creatorEcosystemDashboardOverview,
  creatorEcosystemSummary,
  getAboutEcosystem
};
