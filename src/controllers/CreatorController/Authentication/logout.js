const Token = require("../../../models/Token");

const logOut = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userToken = await Token.findOne({
      where: {
        userId: userId,
      },
    });

    if (!userToken) {
      return res.status(404).json({ message: "No token found for this user" });
    }

    await userToken.destroy();
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = logOut;
