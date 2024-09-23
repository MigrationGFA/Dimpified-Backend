const Creator = require("../models/Creator");

const showUser = async (req, res) => {
  try {
    const user = await Creator.findOne({
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: [
          "password",
          "verificationToken",
          "passwordToken",
          "passwordTokenExpirationDate",
        ],
      },
    });
    if (!user) return res.sendStatus(404);
    return res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  showUser,
};
