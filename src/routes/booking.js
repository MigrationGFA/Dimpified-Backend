const express = require("express");
const {
  createBooking,
  getBookings,
  bookingOverview,
  changeBookingStatusToCompleted,
} = require("../controllers/serviceRequest/booking");

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/bookings/:ecosystemDomain", getBookings);
router.get("/booking-overview/:ecosystemDomain", bookingOverview);
router.put("/complete-booking", changeBookingStatusToCompleted);

module.exports = router;
