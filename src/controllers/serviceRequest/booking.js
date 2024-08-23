// const BarberBooking = require("../../models/Booking/Barber");

// const createBooking = async (req, res) => {
//   try {
//     const {
//       fullName,
//       emailAddress,
//       phoneNumber,
//       locationOfAttendance,
//       address,
//       service,
//       startDateTime,
//       endDateTime,
//       subDomain,
//       templateType,
//     } = req.body;

//     let BookingModel;
//     if (templateType === "barber") {
//       BookingModel = BarberBooking;
//     } else {
//       return res.status(400).json({ message: "Invalid template type" });
//     }

//     const existingBooking = await BookingModel.findOne({
//       $or: [
//         {
//           startDateTime: { $lte: endDateTime },
//           endDateTime: { $gte: startDateTime },
//         },
//       ],
//     });

//     if (existingBooking) {
//       return res
//         .status(400)
//         .json({ message: "The selected date and time are already booked." });
//     }

//     const newBooking = new BookingModel({
//       fullName,
//       emailAddress,
//       phoneNumber,
//       locationOfAttendance,
//       subDomain,
//       address,
//       service,
//       startDateTime,
//       endDateTime,
//     });

//     await newBooking.save();

//     res
//       .status(201)
//       .json({ message: "Booking created successfully", booking: newBooking });
//   } catch (error) {
//     console.log("error:", error);
//     res.status(500).json({ message: "Failed to create booking", error });
//   }
// };

// const getBookings = async (req, res) => {
//   try {
//     const subDomain = req.params.subDomain;

//     if (!subDomain) {
//       return res.status(400).json({ message: "Please provide subdomain" });
//     }

//     const bookings = await BarberBooking.find({ subDomain });

//     if (!bookings || bookings.length == 0) {
//       return res.status(404).json({ message: "You hae no bookings" });
//     }

//     res.status(200).json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to retrieve booking", error });
//   }
// };

// module.exports = { createBooking, getBookings };
