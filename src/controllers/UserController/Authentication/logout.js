const Token = require("../../../models/Token");

const logOutUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userToken = await Token.findOne({ where: { userId: userId } });

    if (userToken) {
      await userToken.destroy();
      return res.status(200).json({ message: "User logged out successfully" });
    }

    return res.status(404).json({ message: "Token not found" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", detail: error });
  }
};

module.exports = logOutUser;
