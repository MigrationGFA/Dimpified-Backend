const Booking = require("../../../models/DimpBooking");
const Transaction = require("../../../models/ecosystemTransaction");
const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../../../config/dbConnect");

const weeklyBookingStats = async (req, res) => {
  const { ecosystemDomain } = req.params;
  const currentDate = new Date();

  // Start and end of the current month
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

    // Create a mapping of week labels to bookings
    const bookingsMap = bookingsPerWeek.reduce((acc, cur) => {
      acc[cur.week] = cur.totalBookings;
      return acc;
    }, {});

    // Calculate total bookings for the entire month
    const totalMonthlyBookings = bookingsPerWeek.reduce(
      (total, cur) => total + cur.totalBookings,
      0
    );

    // Final results for each week
    const finalResults = weekLabels.map((label) => ({
      week: label,
      totalBookings: bookingsMap[label] || 0,
    }));

    res.json({
      month: currentMonthName,
      totalMonthlyBookings, // Add the total monthly bookings to the response
      bookings: finalResults,
    });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

// const weeklyIncomeStats = async (req, res) => {
//   const { ecosystemDomain } = req.params;
//   const currentDate = new Date();

//   const startOfMonth = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth(),
//     1
//   );
//   const endOfMonth = new Date(
//     currentDate.getFullYear(),
//     currentDate.getMonth() + 1,
//     0
//   );
//   const totalWeeks = Math.ceil(
//     (endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7
//   );

//   const weeklyIncome = {};
//   for (let i = 1; i <= totalWeeks; i++) {
//     weeklyIncome[`Week ${i}`] = 0.0;
//   }

//   try {
//     const incomePerWeek = await Transaction.findAll({
//       where: {
//         ecosystemDomain: ecosystemDomain,
//         itemTitle: "Booking",
//         status: "Paid",
//         transactionDate: {
//           [Op.between]: [startOfMonth, endOfMonth],
//         },
//       },
//       attributes: [
//         [
//           literal(`FLOOR((DAYOFMONTH(transactionDate) - 1) / 7) + 1`),
//           "weekNumber",
//         ],
//         [fn("SUM", col("amount")), "totalIncome"],
//       ],
//       group: ["weekNumber"],
//       order: [[literal("weekNumber"), "ASC"]],
//     });

//     incomePerWeek.forEach((item) => {
//       const weekNumber = item.get("weekNumber");
//       weeklyIncome[`Week ${weekNumber}`] = parseFloat(item.get("totalIncome"));
//     });

//     res.json({
//       month: currentDate.toLocaleString("default", { month: "long" }),
//       weeklyIncome,
//     });
//   } catch (error) {
//     console.error("Error fetching weekly income stats:", error);
//     res.status(500).json({
//       message: "An error occurred while fetching income stats",
//       error,
//     });
//   }
// };

const weeklyIncomeStats = async (req, res) => {
  const { ecosystemDomain } = req.params;
  const currentDate = new Date();

  // Start and end of the current month
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

  // Calculate the number of weeks in the current month
  const totalWeeks = Math.ceil(
    (endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7
  );

  // Initialize an object to store weekly income
  const weeklyIncome = {};
  for (let i = 1; i <= totalWeeks; i++) {
    weeklyIncome[`Week ${i}`] = 0.0;
  }

  try {
    // Fetch income per week
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

    // Sum up the total income per week
    let totalMonthlyIncome = 0;
    incomePerWeek.forEach((item) => {
      const weekNumber = item.get("weekNumber");
      const income = parseFloat(item.get("totalIncome"));
      weeklyIncome[`Week ${weekNumber}`] = income;
      totalMonthlyIncome += income;
    });

    // Send the response with weekly income and total monthly income
    res.json({
      month: currentDate.toLocaleString("default", { month: "long" }),
      weeklyIncome,
      totalMonthlyIncome, // Add total monthly income to the response
    });
  } catch (error) {
    console.error("Error fetching weekly income stats:", error);
    res.status(500).json({
      message: "An error occurred while fetching income stats",
      error,
    });
  }
};

module.exports = { weeklyBookingStats, weeklyIncomeStats };
