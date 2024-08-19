const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  locationOfAttendance: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  subDomain: {
    type: String,
    required: true,
  },
});

const BarberBooking = mongoose.model("BarberBooking", bookingSchema);

module.exports = BarberBooking;
