const Ecosystem = require("../../models/Ecosystem");
const EcosystemUser = require("../../models/EcosystemUser");
const EcosystemResolution = require("../../models/Resolution");

const createEcosystemUserResolution = async (req, res) => {
    await EcosystemResolution.sync()
    try {
        const {
            userId,
            reason,
            message,
            ecosystemDomain
        } = req.body;
        const details = [
            "userId",
            "reason",
            "message",
            "ecosystemDomain"
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        };
        //Check if the user exist
        const user = await EcosystemUser.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        //check if domain name exist
        const domainName = await Ecosystem.findOne({ ecosystemDomain })
        if (!domainName) {
            return res.status(404).json({ message: "No Ecosystem with that domain name" })
        }
        const creatorId = domainName.creatorId;
        // Submit a resolution request
        const submitResolutionRequest = await EcosystemResolution.create({
            userId,
            reason,
            message,
            creatorId,
            ecosystemDomain
        })

        return res.status(201).json({ submitResolutionRequest })

    } catch (error) {
        console.error("Error creating conflict resolution:", error);
        return res.status(500).json({ error: "Internal server error" });
    };
};


const getMyResolutionRequest = async (req, res) => {
    try {
        const userId = req.params.userId;

        const myResolutionRequest = await EcosystemResolution.findAll({
            where: {
                userId: userId
            },
            order: [["createdAt", "DESC"]]
        });
        res.status(200).json({ myResolutionRequest })
    } catch (error) {
        console.error("Error fetching my resolution request:", error);
        res.status(500).json({ error: "Internal server error" })
    }
};

const getEcosystemResolutionRequest = async (req, res) => {
    try {
        const { ecosystemDomain } = req.query

        if (!ecosystemDomain) {
            return res.status(400).json({ error: "ecosystemDomain is required" });
        }

        const ecosystemResolutionRequests = await EcosystemResolution.findAll({
            where: {
                ecosystemDomain: ecosystemDomain
            },
            order: [["createdAt", "DESC"]]
        })

        res.status(200).json({ ecosystemResolutionRequests })

    } catch (error) {
        console.error("Error fetching ecosystem resolution requests:", error);
        res.status(500).json({ error: "Internal server error" })
    }
};


const getCreatorResolutionRequest = async (req, res) => {
    try {
        const { ecosystemDomain } = req.params;

        if (!ecosystemDomain) {
            return res.status(400).json({ error: "ecosystemDomain is required" });
        }

        // Fetch creatorId from the Ecosystem collection using ecosystemDomain
        const ecosystem = await Ecosystem.findOne({ ecosystemDomain });

        if (!ecosystem) {
            return res.status(404).json({ error: "Ecosystem not found" });
        }

        const creatorId = ecosystem.creatorId;

        const creatorResolutionRequests = await EcosystemResolution.findAll({
            where: {
                creatorId: creatorId
            },
            order: [["createdAt", "DESC"]],
            include: [{ model: EcosystemUser, attributes: ["username", "email"] }]
        });

        res.status(200).json({ creatorResolutionRequests });
    } catch (error) {
        console.error("Error fetching creator resolution requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



module.exports = {
    createEcosystemUserResolution,
    getEcosystemResolutionRequest,
    getMyResolutionRequest,
    getCreatorResolutionRequest
}


// const getCreatorResolutionRequest = async (req, res) => {
//     try {

//         const creatorId = req.params.creatorId

//         if (!creatorId) {
//             return res.status(400).json({ error: "creatorId is required" });
//         };

//         const creatorResolutionRequests = await EcosystemResolution.findAll({
//             where: {
//                 creatorId: creatorId
//             },

//             order: [["CreatedAt", "DESC"]],

//             include: [{ model: EcosystemUser, attributes: ["username", "email"] }]
//         });

//         res.status(200).json({ creatorResolutionRequests })
//     } catch (error) {
//         console.error("Error fetching creator resolution requests:", error);
//         res.status(500).json({ error: "Internal server error" })
//     }
// };





// const getAllResolutionRequest = async (req, res) => {
//     try {
//         const resolutionRequest = await EcosystemResolution.findAll({
//             order: [["createdAt", "DESC"]],
//             include: [{ model: EcosystemUser, attributes: ["username", "email"] }]
//         })
//         res.status(200).json({ resolutionRequest })
//     } catch (error) {
//         console.error("Error fetching conflicts Request:", error);
//         res.status(500).json({ error: "Internal server error" });
//     };
// };



// const completedResolutionRequest = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const resolution = await EcosystemResolution.findByPK(id, {
//             include: [{
//                 model: EcosystemUser,
//                 attributes: ['username', 'email'],
//             }]
//         })

//         if (!resolution) {
//             return res.status(404).json({ message: "Resolution not found" });
//         }
//     } catch (error) {
//         console.error("Error marking resolution request as completed:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// }