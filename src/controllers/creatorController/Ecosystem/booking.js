const booking = require("../../../services/booking");

exports.createBooking = async (req, res) => {
  try {
    const response = await booking.createBooking(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.bookingOverview = async (req, res) => {
  try {
    const response = await booking.bookingOverview(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.weeklyBookingStats = async (req, res) => {
  try {
    const response = await booking.weeklyBookingStats(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getBookingByDate = async (req, res) => {
  try {
    const response = await booking.getBookingByDate(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.monthlyBookingStats = async (req, res) => {
  try {
    const response = await booking.monthlyBookingStats(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error creating business details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.checkAvailableTime = async (req, res) => {
  try {
    const response = await booking.checkAvailableTime(req.params);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error checking time:", error);
    res.status(500).json({ message: "Server error" });
  }
};
