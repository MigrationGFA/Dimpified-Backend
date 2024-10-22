const Booking = require("../../../models/DimpBooking");
const Transaction = require("../../../models/ecosystemTransaction");
const { Op, fn, col, literal } = require("sequelize");
const moment = require("moment");
const { sequelize } = require("../../../config/dbConnect");

const weeklyBookingStats = async (req, res) => {
  const { ecosystemDomain } = req.params;
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

  try {
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

    res.json({
      month: currentMonthName,
      totalMonthlyBookings,
      bookings: finalResults,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const weeklyIncomeStats = async (req, res) => {
  const { ecosystemDomain } = req.params;
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const totalWeeks = Math.ceil(
    (endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7
  );

  const weeklyIncome = {};
  for (let i = 1; i <= totalWeeks; i++) {
    weeklyIncome[`Week ${i}`] = 0.0;
  }

  try {
    const incomePerWeek = await Transaction.findAll({
      where: {
        ecosystemDomain: ecosystemDomain,
        itemTitle: "Booking",
        status: "Paid",
        transactionDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      attributes: [
        [
          literal(`FLOOR((DAYOFMONTH(transactionDate) - 1) / 7) + 1`),
          "weekNumber",
        ],
        [fn("SUM", col("amount")), "totalIncome"],
      ],
      group: ["weekNumber"],
      order: [[literal("weekNumber"), "ASC"]],
    });

    let totalMonthlyIncome = 0;
    incomePerWeek.forEach((item) => {
      const weekNumber = item.get("weekNumber");
      const income = parseFloat(item.get("totalIncome"));
      weeklyIncome[`Week ${weekNumber}`] = income;
      totalMonthlyIncome += income;
    });

    res.json({
      month: currentDate.toLocaleString("default", { month: "long" }),
      weeklyIncome,
      totalMonthlyIncome,
    });
  } catch (error) {
    console.error("Error fetching weekly income stats:", error);
    res.status(500).json({
      message: "An error occurred while fetching income stats",
      error,
    });
  }
};

const dailySuccessfulTransaction = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;
    const currentDate = new Date();

    const startOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      23,
      59,
      59
    );

    const totalAmount = await Transaction.sum("amount", {
      where: {
        ecosystemDomain: ecosystemDomain,
        status: "successful",
        transactionDate: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    res.json({
      message: "Total successful transactions for today",
      totalAmount: totalAmount || 0,
    });
  } catch (error) {
    console.error("Error fetching today's transactions:", error);
    res.status(500).json({
      message: "Error fetching today's transactions",
      error,
    });
  }
};

const lastSixMonthsSales = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "ecosystemDomain is required" });
    }

    const currentMonth = moment().startOf("month");
    const fiveMonthsAgo = moment().subtract(5, "months").startOf("month");

    const salesData = await Booking.aggregate([
      {
        $match: {
          date: {
            $gte: fiveMonthsAgo.toDate(),
            $lte: currentMonth.endOf("month").toDate(),
          },
          paymentStatus: "Paid",
          ecosystemDomain: ecosystemDomain,
        },
      },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalSales: { $sum: "$price" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
    ]);

    const allMonthsInRange = generateMonthRange(fiveMonthsAgo, currentMonth);

    salesData.forEach((data) => {
      const monthName = moment()
        .month(data._id.month - 1)
        .year(data._id.year)
        .format("MMMM YYYY");

      const matchingMonth = allMonthsInRange.find((m) => m.month === monthName);
      if (matchingMonth) {
        matchingMonth.totalSales = data.totalSales;
      }
    });

    const currentMonthSales = allMonthsInRange[5]?.totalSales || 0;
    const lastMonthSales = allMonthsInRange[4]?.totalSales || 0;

    const percentageDifference = calculatePercentageDifference(
      currentMonthSales,
      lastMonthSales
    );

    const response = {
      currentMonthSales,
      lastMonthSales,
      percentageDifference,
      salesWithMonthNames: allMonthsInRange,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const monthlyBookingStats = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    if (!ecosystemDomain) {
      return res.status(400).json({ message: "ecosystemDomain is required" });
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

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({ message: "Server error" });
  }
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

const generateMonthRange = (start, end) => {
  const months = [];
  const current = moment(start);

  while (current.isSameOrBefore(end, "month")) {
    months.push({
      month: current.format("MMMM YYYY"),
      totalSales: 0, //
    });
    current.add(1, "month");
  }

  return months;
};

const calculatePercentageDifference = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

module.exports = {
  weeklyBookingStats,
  weeklyIncomeStats,
  dailySuccessfulTransaction,
  lastSixMonthsSales,
  monthlyBookingStats,
};
