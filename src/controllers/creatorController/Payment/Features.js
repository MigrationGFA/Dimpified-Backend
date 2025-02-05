const ecosystemFeature = require("../../../services/paymentServices");

exports.createBookingRecord = async (req, res) => {
  try {
    const response = await ecosystemFeature.createBookingRecord(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying subscribtion:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
