const Token = require("../../../models/Token");

const logOut = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userToken = await Token.findOne({
      where: {
        userId: userId,
      },
    });
    if (userToken) {
      await userToken.destroy();
      return res.status(200).json({ message: "User Logout Successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", message: error });
  }
};

module.exports = logOut;
