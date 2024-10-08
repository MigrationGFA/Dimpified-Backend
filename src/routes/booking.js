const express = require("express");
const {
  createBooking,
  getBookings,
  bookingOverview,
  changeBookingStatusToCompleted,
  onsiteBooking,
  getBookingByDate,
} = require("../controllers/serviceRequest/booking");

const 
  authenticatedUser
 = require("../middleware/authentication")

const router = express.Router();

router.post("/create-booking",  createBooking);
router.post("/onsite-booking", authenticatedUser, onsiteBooking);
router.get("/bookings/:ecosystemDomain", authenticatedUser,getBookings);
router.get("/bookings-per-date/:ecosystemDomain/:date", authenticatedUser,getBookingByDate);
router.get("/booking-overview/:ecosystemDomain", authenticatedUser, bookingOverview);
router.put("/complete-booking", authenticatedUser, changeBookingStatusToCompleted);

module.exports = router;
