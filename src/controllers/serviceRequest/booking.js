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
      description,
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
      ecosystemDomain,
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
      description,
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

const bookingOverview = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const allBookings = await Booking.find({ ecosystemDomain });

    const sortByDateDesc = (a, b) => new Date(b.date) - new Date(a.date);

    const todayBookings = allBookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startOfToday && bookingDate <= endOfToday;
      })
      .sort(sortByDateDesc);

    const weekBookings = allBookings
      .filter((booking) => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
      })
      .sort(sortByDateDesc);

    const [pendingBookings, completedBookings] = await Promise.all([
      Booking.find({ ecosystemDomain, status: "Pending" }).sort({ date: -1 }),
      Booking.find({ ecosystemDomain, status: "Completed" }).sort({ date: -1 }),
    ]);

    res.status(200).json({
      todayBookings,
      weekBookings,
      allBookings: allBookings.sort(sortByDateDesc),
      pendingBookings,
      completedBookings,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to retrieve bookings", error });
  }
};

const changeBookingStatusToCompleted = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: "Completed" },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking status updated to Completed",
      booking: updatedBooking,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to update booking status", error });
  }
};

module.exports = {
  createBooking,
  getBookings,
  bookingOverview,
  changeBookingStatusToCompleted,
};
