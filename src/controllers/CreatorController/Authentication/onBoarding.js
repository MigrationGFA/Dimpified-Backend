const Creator = require("../../../models/Creator");

const onBoarding = async (req, res) => {
  try {
    const { userId, numberOfTargetAudience, categoryInterest } = req.body;
    const details = ["userId", "numberOfTargetAudience", "categoryInterest"];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }
    if (
      !categoryInterest &&
      !Array.isArray(categoryInterest) &&
      categoryInterest.length === 0
    ) {
      return res.status(400).json({
        message: "Please select at least one category interest.",
      });
    }

    const updatedUser = await Creator.findOne({
      where: {
        id: userId,
      },
    });

    // Check if user exists
    if (!updatedUser) {
      return res.status(401).json({ message: "User not found" });
    }
    const interestStringified = JSON.stringify(categoryInterest)
    // Update user's interests
    await updatedUser.update({ categoryInterest: interestStringified,numberOfTargetAudience  });


    return res.status(200).json({
      message: "Onboarding successful",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error during onboarding:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = onBoarding;
