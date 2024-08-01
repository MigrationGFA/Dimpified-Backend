const Ecosystem = require("../../../models/Ecosystem");
const EcosystemUser = require("../../../models/EcosystemUser");

const getUserProfile = async (req, res) => {
  const ecosystemDomain = req.params.ecosystemDomain;
  
  try {
    const ecosystemStudent = await Ecosystem.findOne({ ecosystemDomain });

    if (!ecosystemStudent) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const ecosystemUser = await EcosystemUser.findAll({
      where: {
        ecosystemDomain: ecosystemDomain,
      },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ ecosystemUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};