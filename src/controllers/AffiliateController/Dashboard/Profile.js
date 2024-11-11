const dashboardServices = require("../../../services/affiliateServices/dashboardServices");


exports.createAffiliateProfile = async (req, res) => {
    const file = req.file;
    const body = req.body;
    try {
        const response = await dashboardServices.createAffiliateProfile(body, file);
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error creating affiliate profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getAffiliateProfile = async (req, res) => {
    try {
        const response = await dashboardServices.getAffiliateProfile(req.params)
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error("Error getting affiliate profile:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}