const Booking = require("../../models/DimpBooking");
const Ecosystem = require("../../models/Ecosystem");

const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      address,
      service,
      bookingType,
      date,
      time,
      price,
      ecosystemDomain,
    } = req.body;

    const requiredFields = [
      "ecosystemDomain",
      "name",
      "email",
      "phone",
      "location",
      "bookingType",
      "service",
      "date",
      "time",
      "price",
    ];

    // Check for missing fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(400).json({ message: "Ecosystem not found" });
    }

    const existingBooking = await Booking.findOne({
      date,
      time,
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "The selected date and time are already booked .",
      });
    }

    const generateUniqueId = () => {
      const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
      const numbers = Math.floor(100 + Math.random() * 900);
      return `${letters}${numbers}`;
    };

    const bookingId = generateUniqueId();

    const newBooking = new Booking({
      bookingId,
      name,
      email,
      phone,
      location,
      address,
      service,
      date,
      time,
      price,
      bookingType,
      ecosystemDomain,
    });

    await newBooking.save();

    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to create booking", error });
  }
};

const getBookings = async (req, res) => {
  try {
    const ecosystemDomain = req.params.ecosystemDomain;

    if (!ecosystemDomain) {
      return res
        .status(400)
        .json({ message: "Please provide an ecosystem domain" });
    }

    const bookings = await Booking.find({ ecosystemDomain });

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this ecosystem domain" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to retrieve bookings", error });
  }
};

module.exports = { createBooking, getBookings };
