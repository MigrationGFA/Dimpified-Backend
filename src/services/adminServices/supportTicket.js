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
  // Fetch all CreatorSupport records with the associated Creator email
  const allSupports = await CreatorSupport.findAll({
    attributes: ["id", "reason", "message", "status", "createdAt", "updatedAt"], // Select support fields
    include: [
      {
        model: Creator, // Join with the Creator model
        attributes: ["email"], // Only fetch the email field
      },
    ],
    order: [["createdAt", "DESC"]], // Order by creation date
  });

  // Prepare the response
  const supportsWithEmails = allSupports.map((support) => ({
    id: support.id,
    reason: support.reason,
    message: support.message,
    status: support.status,
    createdAt: support.createdAt,
    updatedAt: support.updatedAt,
    email: support.Creator?.email || null, // Attach the email or null if Creator is not found
  }));

  return {
    status: 200,
    data: {
      message: supportsWithEmails,
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
