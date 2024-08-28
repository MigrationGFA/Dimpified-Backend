const Booking = require("../../models/DimpBooking"); // Ensure this path is correct
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
      dateAndTime,
      price,
      ecosystemDomain,
    } = req.body;

    const requiredFields = [
      "ecosystemDomain",
      "name",
      "email",
      "phone",
      "location",
      "service",
      "dateAndTime",
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
      res.status(400).json({ messsage: "Ecosystem not found" });
    }

    const existingBooking = await Booking.findOne({
      location,
      dateAndTime,
    });

    if (existingBooking) {
      return res.status(400).json({
        message:
          "The selected date and time are already booked at this location.",
      });
    }

    const newBooking = new Booking({
      name,
      email,
      phone,
      location,
      address,
      service,
      dateAndTime,
      price,
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
