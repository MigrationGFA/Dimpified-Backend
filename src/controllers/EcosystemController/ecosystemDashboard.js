const Course = require("../../models/Course");
const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const Service = require("../../models/Service");

const getAllEcosystemData = async (req, res) => {
    const ecosystemId = req.params.ecosystemId

    try {
        const ecosystemData = await Ecosystem.findOne({ _id: ecosystemId, })


        if (!ecosystemData) {
            return res.status(404).json({ message: "Ecosystem not found" })
        }

        const courses = await Course.find({ ecosystemId }).sort({ createdAt: -1 });

        const services = await Service.find({ ecosystemId }).sort({ createdAt: -1 });


        res.json({
            ecosystem: ecosystemData.ecosystemName,
            domain: ecosystemData.ecosystemDomain,
            courses,
            services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

};

const getAllEcosystemStudent = async (req, res) => {
    const ecosystemId = req.params.ecosystemId
    try {
        const ecosystemData = await Ecosystem.findOne({ _id: ecosystemId, ecosystemDomain: domain })

        if (!ecosystemData) {
            return res.status(404).json({ message: "Ecosystem not found" })
        }

        const ecosystemUser = await EcosystemUser.findAll({
            where: {
                ecosystemDomain: domain
            },
            order: [["createdAt", "DESC"]],
        })
        res.status(200).json({ ecosystemUser })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

}

module.exports = { getAllEcosystemData, getAllEcosystemStudent }

