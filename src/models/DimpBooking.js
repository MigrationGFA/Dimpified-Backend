const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    ecosystemDomain: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,

      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    dateAndTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Unpaid"],
      default: "Pending",
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
