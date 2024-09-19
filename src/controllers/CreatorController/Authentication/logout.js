const CreatorToken = require("../../../models/CreatorToken");

const logOut = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const creatorToken = await CreatorToken.findOne({
      where: {
        userId: userId,
      },
    });

    if (!creatorToken) {
      return res.status(401).json({ message: "No token found for this user" });
    }

    await creatorToken.destroy();
    return res.status(200).json({ message: "Creator logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = logOut;
