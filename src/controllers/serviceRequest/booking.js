const Creator = require("../../models/Creator");
const Booking = require("../../models/DimpBooking");
const Ecosystem = require("../../models/Ecosystem");
const sendBookingConfirmationEmail = require("../../utils/bookingNotification");
const EcosystemUser = require("../../models/EcosystemUser");
const CreatorTemplate = require("../../models/creatorTemplate");
const sendBookingConfirmationUnpaidEmail = require("../../utils/sendBookingConfirmationUnpaid");

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
        message: "The selected date and time are already booked.",
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
    const creator = await Creator.findByPk(ecosystem.creatorId);
    console.log("creator:",creator)

    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }
    const newUser = await Booking.findOne({
      email,
      ecosystemDomain,
    });
    if (!newUser) {
      creator.userCount += 1;
    }
    creator.transactionNumber += 1;
    await creator.save();

    await sendBookingConfirmationEmail({
      email: creator.email,
      name: creator.organizationName,
      bookingId,
      service,
      bookingType,
      date,
      time,
    });
console.log("ecosystem:",ecosystem)


    // Get creator's business logo and address from the template
    const creatorTemplate = await CreatorTemplate.findOne({ ecosystemDomain });
    console.log("logo:",creatorTemplate.navbar.logo)
    const logo = creatorTemplate.navbar.logo; // Business logo
    const businessAddress = ecosystem.address; // Business address
    const businessName = creator.organizationName; // Business name

    await sendBookingConfirmationUnpaidEmail({
      email,
      name,
      bookingId,
      service,
      bookingType,
      date,
      time,
      paymentStatus: newBooking.paymentStatus,
      businessName, // Passing the business name
      businessAddress, // Passing the business address
      logo, // Passing the logo
    });

    console.log(creator);

    return res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to create booking", error });
  }
};

const onsiteBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      service,
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
      service,
      date,
      time,
      price,
      status: "Completed",
      paymentStatus: "Paid",
      bookingType: "Onsite",
      ecosystemDomain,
    });

    await newBooking.save();

    const creator = await Creator.findByPk(ecosystem.creatorId);

    if (!creator) {
      return res.status(404).json({ messsage: "Creator not found" });
    }
    creator.userCount += 1;
    await creator.save();

    return res
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
        .status(200)
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
    4;
  }
};

const getBookingByDate = async (req, res) => {
  try {
    const { date, ecosystemDomain } = req.params;
    const bookingDate = date ? new Date(date) : new Date();

    //const formattedDate = bookingDate.toISOString().split("T")[0];

    console.log("params:", req.params);
    const bookings = await Booking.find({
      date: bookingDate,
      ecosystemDomain,
    });

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this date" });
    }

    return res.status(200).json({ bookings });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Failed to get bookings", error });
  }
};

module.exports = {
  createBooking,
  getBookingByDate,
  getBookings,
  bookingOverview,
  changeBookingStatusToCompleted,
  onsiteBooking,
};
