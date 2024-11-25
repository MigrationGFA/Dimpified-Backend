const Creator = require("../models/Creator");
const Booking = require("../models/DimpBooking");
const Ecosystem = require("../models/Ecosystem");
const CreatorTemplate = require("../models/creatorTemplate");
const sendBookingConfirmationUnpaidEmail = require("../utils/sendBookingConfirmationUnpaid");
const sendBookingConfirmationPaidEmail = require("../utils/sendBoookingConfirmationEmailPaid");
const moment = require("moment");
const EcosystemUser = require("../models/EcosystemUser");
const Notification = require("../models/ecosystemNotification");
const bcrypt = require("bcryptjs");
const newsSendSMS = require("../helper/newSms")
const CreatorProfile = require("../models/CreatorProfile");


const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("0")) {
    return `234${phoneNumber.slice(1)}`;
  }
  
  return phoneNumber; 
};

exports.createBooking = async (body) => {
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
  } = body;

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
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    return { status: 400, data: { message: "Ecosystem not found" } };
  }

  const existingBooking = await Booking.findOne({
    date,
    time,
    ecosystemDomain,
  });

  if (existingBooking) {
    return {
      status: 400,
      data: {
        message: "The selected date and time are already booked.",
      },
    };
  }

  const generateUniqueId = () => {
    const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
    const numbers = Math.floor(100 + Math.random() * 900);
    return `${letters}${numbers}`;
  };

  let user;

  // Find or create EcosystemUser based on email and ecosystemDomain
  user = await EcosystemUser.findOne({ where: { email, ecosystemDomain } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(email, 10);
    user = await EcosystemUser.create({
      email,
      ecosystemDomain,
      username: name,
      password: hashedPassword,
    });
  }

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
  console.log("ecosystem:", ecosystem);
  const creator = await Creator.findByPk(ecosystem.creatorId);
  console.log("creator:", creator);

  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
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

  

  await sendBookingConfirmationPaidEmail({
    email: creator.email,
    name: creator.organizationName,
    paymentStatus: newBooking.paymentStatus,
    bookingId,
    service,
    bookingType,
    date,
    time,
  });
  console.log("ecosystem:", ecosystem);

  // Get creator's business logo and address from the template
  const creatorTemplate = await CreatorTemplate.findOne({ ecosystemDomain });
  console.log("logo:", creatorTemplate.navbar.logo);
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
    businessName, 
    businessAddress, 
    logo, 
  });

  console.log(creator);

  // Create a notification for the booking
  const notificationMessage = `New booking created by ${name} for the ${service} service on ${date} at ${time}. Booking ID: ${bookingId}`;
  const newNotification = new Notification({
    type: "New Booking",
    message: notificationMessage,
    ecosystemDomain,
    creatorId: ecosystem.creatorId,
  });

  await newNotification.save();

   const creatorProfile = await CreatorProfile.findOne({
    creatorId: creator.id,
  });
  console.log("this is creatorProfile", creatorProfile)

  if(creatorProfile){
    const newPhoneNumber = formatPhoneNumber(creatorProfile.phoneNumber)
  const response = await  newsSendSMS(newPhoneNumber , `DIMP, New booking created by ${name} for  ${service} service on ${date} at ${time}. Booking ID: ${bookingId}`, "plain");
  }

  

  return {
    status: 200,
    data: { message: "Booking created successfully", booking: newBooking },
  };
};

exports.bookingOverview = async (params) => {
  const { ecosystemDomain } = params;

  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const endOfToday = new Date(today.setHours(23, 59, 59, 999));

  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
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

  return {
    status: 200,
    data: {
      todayBookings,
      weekBookings,
      allBookings: allBookings.sort(sortByDateDesc),
      pendingBookings,
      completedBookings,
    },
  };
};

exports.weeklyBookingStats = async (params) => {
  const { ecosystemDomain } = params;
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const week1End = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    7
  );
  const week2End = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    14
  );
  const week3End = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    21
  );
  const week4End = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    28
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthName = monthNames[currentDate.getMonth()];

  const weekLabels = [
    "Week 1 (Day 1-7)",
    "Week 2 (Day 8-14)",
    "Week 3 (Day 15-21)",
    "Week 4 (Day 22-28)",
    "Week 5 (Day 29-End)",
  ];

  const bookingsPerWeek = await Booking.aggregate([
    {
      $match: {
        ecosystemDomain: ecosystemDomain,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $addFields: {
        weekLabel: {
          $switch: {
            branches: [
              {
                case: { $lte: ["$date", week1End] },
                then: "Week 1 (Day 1-7)",
              },
              {
                case: {
                  $and: [
                    { $gt: ["$date", week1End] },
                    { $lte: ["$date", week2End] },
                  ],
                },
                then: "Week 2 (Day 8-14)",
              },
              {
                case: {
                  $and: [
                    { $gt: ["$date", week2End] },
                    { $lte: ["$date", week3End] },
                  ],
                },
                then: "Week 3 (Day 15-21)",
              },
              {
                case: {
                  $and: [
                    { $gt: ["$date", week3End] },
                    { $lte: ["$date", week4End] },
                  ],
                },
                then: "Week 4 (Day 22-28)",
              },
              {
                case: { $gt: ["$date", week4End] },
                then: "Week 5 (Day 29-End)",
              },
            ],
            default: "Unknown Week",
          },
        },
      },
    },
    {
      $group: {
        _id: "$weekLabel",
        totalBookings: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        _id: 0,
        week: "$_id",
        totalBookings: 1,
      },
    },
  ]);

  const bookingsMap = bookingsPerWeek.reduce((acc, cur) => {
    acc[cur.week] = cur.totalBookings;
    return acc;
  }, {});

  const totalMonthlyBookings = bookingsPerWeek.reduce(
    (total, cur) => total + cur.totalBookings,
    0
  );

  const finalResults = weekLabels.map((label) => ({
    week: label,
    totalBookings: bookingsMap[label] || 0,
  }));

  return {
    status: 200,
    data: {
      month: currentMonthName,
      totalMonthlyBookings,
      bookings: finalResults,
    },
  };
};

exports.getBookingByDate = async (params) => {
  const { date, ecosystemDomain } = params;
  const bookingDate = date ? new Date(date) : new Date();

  //const formattedDate = bookingDate.toISOString().split("T")[0];

  console.log("params:", params);
  const bookings = await Booking.find({
    date: bookingDate,
    ecosystemDomain,
  });

  if (!bookings.length) {
    return { status: 404, data: "No bookings found for this date" };
  }

  return { status: 200, data: bookings };
};

exports.monthlyBookingStats = async (params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return {
      status: 400,
      data: {
        message: "ecosystemDomain is required",
      },
    };
  }

  const currentMonth = moment().startOf("month");
  const fiveMonthsAgo = moment().subtract(5, "months").startOf("month");

  // Query to get total bookings from the last 6 months filtered by ecosystemDomain
  const bookingsData = await Booking.aggregate([
    {
      $match: {
        date: {
          $gte: fiveMonthsAgo.toDate(),
          $lte: currentMonth.endOf("month").toDate(),
        },
        ecosystemDomain: ecosystemDomain,
      },
    },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        totalBookings: { $sum: 1 }, // Count the bookings
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 }, // Sort by most recent
    },
  ]);

  // Create array with all months in the range (with zero bookings by default)
  const allMonthsInRange = generateMonthlyBookingRange(
    fiveMonthsAgo,
    currentMonth
  );

  // Populate actual bookings data into allMonthsInRange
  bookingsData.forEach((data) => {
    const monthName = moment()
      .month(data._id.month - 1)
      .year(data._id.year)
      .format("MMMM YYYY");

    const matchingMonth = allMonthsInRange.find((m) => m.month === monthName);
    if (matchingMonth) {
      matchingMonth.totalBookings = data.totalBookings;
    }
  });

  // Total all-time bookings
  const allTimeTotalBookings = await Booking.countDocuments({
    ecosystemDomain: ecosystemDomain,
  });

  // Prepare response data
  const response = {
    salesWithMonthNames: allMonthsInRange, // Last 5 months including current month
    allTimeTotalBookings,
  };

  return {
    status: 200,
    data: {
      response,
    },
  };
};

function generateMonthlyBookingRange(startMonth, endMonth) {
  const months = [];
  let current = moment(startMonth);

  while (current <= endMonth) {
    months.push({
      month: current.format("MMMM YYYY"),
      totalBookings: 0,
    });
    current = current.add(1, "month");
  }

  return months;
}
