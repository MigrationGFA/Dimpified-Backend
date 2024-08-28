const express = require("express");
const {
  createBooking,
  getBookings,
} = require("../controllers/serviceRequest/booking");

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/bookings/:ecosystemDomain", getBookings);

module.exports = router;
