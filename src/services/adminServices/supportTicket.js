const {
  GetSupportTicketStatusCount,
} = require("../../controllers/AdminController/procedure");
const CreatorSupport = require("../../models/Support");
const Creator = require("../../models/Creator");
const Ecosystem = require("../../models/Ecosystem");

exports.supportTickets = async (req, res) => {
  try {
    const supportCounts = await GetSupportTicketStatusCount();
    res.status(200).json({
      success: true,
      data: supportCounts,
    });
  } catch (error) {
    console.error("Error in /api/ecosystem-transactions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support Counts.",
    });
  }
};

exports.supportTicketInformation = async () => {
  const allSupports = await CreatorSupport.findAll({
    // Only fetch CreatorSupport fields (no include for Creator or Ecosystem)
    attributes: ["id", "reason", "message", "status", "createdAt", "updatedAt"],
    order: [["createdAt", "DESC"]], // Optional: Order by creation date
  });

  return {
    status: 200,
    data: {
      message: allSupports,
    },
  };
};

exports.getASupportInformations = async (params) => {
  const { supportId } = params;

  if (!supportId) {
    return {
      status: 400,
      data: {
        message: "supportId is required",
      },
    };
  }

  // Fetch the creator details
  const allSupport = await CreatorSupport.findOne({
    where: { id: supportId },
    attributes: ["id", "reason", "message", "status", "createdAt", "updatedAt"],
  });

  return {
    status: 200,
    data: allSupport,
  };
};
