const withdrawalServices = require("../../services/adminServices/withdrawal");

exports.approveWithdrawalrequest = async (req, res) => {
  try {
    const response = await withdrawalServices.approveWithdrawalrequest(
      req.body
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("error approving withdrawal request", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
