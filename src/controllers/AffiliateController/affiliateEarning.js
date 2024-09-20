const AffiliateEarning = require("../../models/AffiliateEarning")
const AffiliateEarningHistory = require("../../models/AffiliateEarningHistory")



const getAffiliateEarning = async (req, res) => {
    try {
        const affiliateId = req.params.affiliateId
        if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
        const affiliateEarning =await AffiliateEarning.findOne({
            where: {
                affiliateId: affiliateId
            }
        })
        if(!affiliateEarning){
            return res.status(200).json({ message:  "affiliate does not have earning" });
        }
        return res.status(200).json({ affiliateEarning });
    } catch (error) {
        console.error("Error getting earning details:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
    }
}

const getAffiliateEarningHistory = async (req, res) => {
try {
        const affiliateId = req.params.affiliateId
        if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
        const affiliateEarningHistory =await AffiliateEarningHistory.findAll({
            where: {
                affiliateId: affiliateId
            },
            order: [["createdAt", "DESC"]],
        })
        if(!affiliateEarningHistory){
            return res.status(200).json({message: "affiliate does not have any earning history" });
        }
        return res.status(200).json({  affiliateEarningHistory });
} catch (error) {
      console.error("Error saving bank details:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
}
}



module.exports = {
    getAffiliateEarning,
    getAffiliateEarningHistory
}