const Ecosystem = require("../../models/Ecosystem");

const getEcosystemData = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const result = await Ecosystem.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $addFields: {
          week: { $week: "$createdAt" },
        },
      },
      {
        $group: {
          _id: {
            objective: "$mainObjective",
            week: "$week",
          },
          registrations: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.objective",
          totalRegistrations: { $sum: "$registrations" },
          weeklyData: {
            $push: {
              week: "$_id.week",
              registrations: "$registrations",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          objective: "$_id",
          totalRegistrations: 1,
          weeklyData: 1,
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching registrations by objective:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
    getEcosystemData
}