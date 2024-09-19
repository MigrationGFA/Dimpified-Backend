const User = require("../../models/EcosystemUser");
const SocialProfile = require("../../models/SocialProfile");
const Token = require("../../models/Token");

const DeleteAccount = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("this is user", userId);

    if (!userId) {
      return res.status(400).json({ message: "User id not sent" });
    }

    const user = await User.findByPk(userId);

    if (user) {
      await SocialProfile.destroy({
        where: {
          userId: userId,
        },
      });
      await Token.destroy({
        where: {
          userId: userId,
        },
      });

      await user.destroy();
      return res
        .status(200)
        .json({ message: "User account deleted successfully" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error", message: error });
  }
};

module.exports = DeleteAccount;
