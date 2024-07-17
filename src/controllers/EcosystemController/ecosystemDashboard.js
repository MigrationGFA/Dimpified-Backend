const Course = require("../../models/Course");
const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const Service = require("../../models/Service");

const getAllEcosystemProduct = async (req, res) => {
    const ecosystemDomain = req.params.ecosystemDomain

    try {
        const ecosystemProduct = await Ecosystem.findOne({ ecosystemDomain })


        if (!ecosystemProduct) {
            return res.status(404).json({ message: "Ecosystem not found" })
        }

        const courses = await Course.find({ ecosystemDomain }).sort({ createdAt: -1 });

        const services = await Service.find({ ecosystemDomain }).sort({ createdAt: -1 });


        res.json({
            ecosystem: ecosystemProduct.ecosystemName,
            domain: ecosystemProduct.ecosystemDomain,
            courses,
            services
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

};

const getAllEcosystemStudent = async (req, res) => {
    const ecosystemDomain = req.params.ecosystemDomain

    try {
        const ecosystemStudent = await Ecosystem.findOne({ ecosystemDomain })

        if (!ecosystemStudent) {
            return res.status(404).json({ message: "Ecosystem not found" })
        }

        const ecosystemUser = await EcosystemUser.findAll({
            where: {
                ecosystemDomain: ecosystemDomain
            },
            order: [["createdAt", "DESC"]],
        })
        res.status(200).json({ ecosystemUser })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }

}

module.exports = { getAllEcosystemProduct, getAllEcosystemStudent }

