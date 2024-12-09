const Users = require("../models/AdminUser");

const verifyAdmin = async (req, res, next) => {
  try {
    const userEmail = req.params.email;
    if (!userEmail) {
      return res.status(400).json({ msg: "User ID is required" });
    }
    const user = await Users.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(404).json({ msg: "Admin User does not exist " });
    }
    next();
  } catch (error) {
    console.error("Error creating questions:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

module.exports = verifyAdmin;
