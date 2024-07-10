const Ecosystem = require("../../models/Ecosystem");
const Template = require("../../models/Templates");

const popularEcosystems = async (req, res) => {
  try {
    const creatorId = req.params.creatorId;

    const topEcosystems = await Ecosystem.find({ creatorId })
      .sort({ users: -1 })
      .limit(4);

    if (topEcosystems.length === 0) {
      return res
        .status(404)
        .json({ message: "User has no created ecosystems" });
    }

    const ecosystemsWithLogos = await Promise.all(topEcosystems.map(async (ecosystem) => {
      const template = await Template.findOne({ ecosystemId: ecosystem._id });
      return {
        ...ecosystem.toObject(),
        logo: template ? template.navbar.logo : null
      };
    }));

    res.status(200).json({ ecosystemsWithLogos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

// const allEcosystemUsers = async (req,res)=> {
//     try {
//         const creatorId = req.params.creatorId;


//     } catch (error) {
        
//     }
// }

module.exports = { popularEcosystems };
