const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator")

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

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching registrations by objective:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


const upGradeUser = async (req, res) => {
  try {
    // Step 1: Find all creators with step = 5
    const creators = await Creator.findAll({ where: { step: 5 } });

    // If no creators found, return early
    if (!creators || creators.length === 0) {
      return res.status(404).json({ message: "No creators found with step 5" });
    }

    // Step 2: Extract creator IDs
    const creatorIds = creators.map((creator) => creator.id);

    // Step 3: Update all ecosystems where creatorId matches
    const result = await Ecosystem.updateMany(
      { creatorId: { $in: creatorIds }, completed: "false" }, 
      { $set: { completed: "true" } } 
    );

    // Step 4: Return success response
    return res.status(200).json({
      message: "Ecosystems updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating ecosystems:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getEcosystemData,
  upGradeUser
}