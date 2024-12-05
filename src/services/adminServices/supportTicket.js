const {
  GetSupportTicketStatusCount,
} = require("../../controllers/AdminController/procedure");

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
