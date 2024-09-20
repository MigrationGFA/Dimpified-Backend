const AffiliateEarning = require("../../models/AffiliateEarning")
const AffiliateEarningHistory = require("../../models/AffiliateEarningHistory")
const Creator = require("../../models/Creator")
const Affiliate = require("../../models/Affiliate");
const Subscribers = require("../../models/Subscription")


const getAffiliateDashboardstat = async (req, res) => {
    try {
         const affiliateId = req.params.affiliateId
        if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
        
         const getAffiliate = await Affiliate.findByPk(affiliateId)
     if(!getAffiliate){
             return res.status(404).json({ message: "affiliate does not exist" });
        }
    const totalUser = getAffiliate.onboardedUsers
    const unverifyUsers = await Creator.count({
        where: {
            affiliateId: affiliateId,
            isVerified: false
        },
    })
    const getCreator = await Creator.findAll({
        where: {
            affiliateId: affiliateId,
            
        },
    })

    // Initialize total subscriber count
let totalSubscribers = 0;

// Iterate through each creator to count their subscribers
for (const creator of getCreator) {
    const creatorId = creator.id;

    // Count the number of subscribers for each creator
    const getSubscriberCount = await Subscribers.count({
        where: {
            creatorId: creatorId,
        },
    });
     console.log("this is creator", getCreator)

    // Add to total subscriber count
    totalSubscribers += getSubscriberCount;
}
       const totalEarningHistory = await AffiliateEarningHistory.count({
        where: {
            affiliateId: affiliateId
        }
       })
        return res.status(200).json({ totalUser, unverifyUsers, totalSubscribers, totalEarningHistory });
    } catch (error) {
        console.error("Error getting affiliate details:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
    }
}

const getLastFourOnboardedUsers = async (req, res) => {
    try {
         const affiliateId = req.params.affiliateId
        if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
        const lastFourOnboardedUsers = await Creator.findAll({
            where: {
                affiliateId: affiliateId
            },
            limit: 4,
            order: [["createdAt", "DESC"]],
            attributes: { 
        exclude: ['password', 'id', 'verificationToken', 'passwordToken', 'passwordTokenExpirationDate'] 
      }
        })
        return res.status(200).json({ lastFourOnboardedUsers });
    } catch (error) {
         console.error("Error getting  details:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
    }
}

const getLastFourSubscribeUsers = async (req, res) => {
try {
        const affiliateId = req.params.affiliateId
        if(!affiliateId){
             return res.status(400).json({ message: "affiliateId is required" });
        }
        const lastFourSubscribers = await AffiliateEarningHistory.findAll({
            where: {
                affiliateId: affiliateId
            },
            limit: 4,
            order: [["createdAt", "DESC"]],
             include: [
        {
          model: Creator,
          attributes: ["organizationName", "imageUrl"],
        },
      ],
        })
        if(!lastFourSubscribers){
            return res.status(200).json({message: "affiliate does not have any subscriber onborded user" });
        }
        return res.status(200).json({  lastFourSubscribers });
} catch (error) {
      console.error("Error getting details:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
}
}

module.exports = {
    getAffiliateDashboardstat,
    getLastFourOnboardedUsers,
    getLastFourSubscribeUsers
}