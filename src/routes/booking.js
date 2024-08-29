const express = require("express");
const {
  createBooking,
  getBookings,
  bookingOverview,
} = require("../controllers/serviceRequest/booking");

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/bookings/:ecosystemDomain", getBookings);
router.get("/booking-overview/:ecosystemDomain", bookingOverview);


module.exports = router;
