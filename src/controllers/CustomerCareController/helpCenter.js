const Creator = require("../../models/Creator");
const Ecosystem = require("../../models/Ecosystem");
const EndUser = require("../../models/EcosystemUser");
const HelpCenter = require("../../models/HelpCenter");

const sendHelpRequestFeedback = require("../../utils/sendHelpRequestFeedback");


const sendSupportRequestCompletedEmail = require("../../utils/supportRequestCompleted");


const userHelpCenter = async (req, res) => {
    await HelpCenter.sync()
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
            "ecosystemDomain",
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }
        const user = await EndUser.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const domainName = await Ecosystem.findOne({ ecosystemDomain })
        if (!domainName) {
            return res.status(404).json({ message: "No Ecosystem with that domain name" })
        }
        const creatorId = domainName.creatorId;
        const createHelpRequest = await HelpCenter.create({
            userId,
            reason,
            message,
            creatorId,
            ecosystemDomain,
        });
        return res.status(201).json({
            message: " Your Support Request has been received",
            data: createHelpRequest
        });

    } catch (error) {
        console.log('Help Request Error', error);
        return res.status(500).json({ message: 'Internal Server Error', detail: error })
    }
};
const getAllHelpRequest = async (req, res) => {
    try {
        const allhelpRequest = await HelpCenter.findAll({
            order: [['createdAt', 'DESC']],
            include: {
                model: EndUser,
                attributes: ["username", "imageUrl"],
            },
        })

        res.status(200).json({ allhelpRequest })
    } catch (error) {
        console.log('Cannot find any request', error);
        res.status(500).json({ message: 'Internal Server Error', detail: error });

    };
};

const helpRequestCompleted = async (req, res) => {
    try {
        const { requestId } = req.params
        if (!requestId) {
            return res.status(400).json({ message: "Missing request ID" });
        }

        const helpRequestSubmission = await HelpCenter.findByPk(requestId, {
            include: [
                {
                    model: EndUser,
                    attributes: ['username', 'email']
                }
            ]
        })
        if (!helpRequestSubmission) {
            return res.status(404).json({ message: "Support Request submission not found" })
        }
        await helpRequestSubmission.update(
            { status: "completed" },
            { where: { id: requestId } }

        );
        await sendSupportRequestCompletedEmail({
            username: helpRequestSubmission.EndUser.username,
            email: helpRequestSubmission.EndUser.email,
            helpRequestId: requestId,
            reason: helpRequestSubmission.reason,
            message: helpRequestSubmission.message,
        })
        res.status(200).json({ message: "Your help request marked completed" })
    } catch (error) {
        console.log("Error marking request completed", error)
        res.status(500).json({ message: "Internal Server error", detail: error })
    }
};

const getAnEcosystemUserHelpRequest = async (req, res) => {
    try {
        const { userId, ecosystemDomain } = req.params

        if (!(userId || ecosystemDomain)) {
            return res.status(404).json({ message: "Ecosystem domain and userId needed" })
        }
        const ecosystemUserHelpRequest = await HelpCenter.findAll({
            where: {
                userId: userId,
                ecosystemDomain: ecosystemDomain

            },
            order: [["createdAt", "DESC"]],
        })
        res.status(200).json({ ecosystemUserHelpRequest })
    } catch (error) {
        console.error("Error fetching ecosystem user help requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getHelpRequestByEcosystem = async (req, res) => {
    try {
        const ecosystemDomain = req.params.ecosystemDomain;

        if (!ecosystemDomain) {
            return res.status(400).json({ message: "Missing Ecosystem domain" });
        }
        const helpRequestByEcosystem = await HelpCenter.findAll({
            where: {
                ecosystemDomain: ecosystemDomain,
            },
            order: [["createdAt", "DESC"]],
        })
        res.status(200).json({ helpRequestByEcosystem })
    } catch (error) {
        console.error("Error fetching ecosystem help requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getCreatorHelpRequest = async (req, res) => {
    try {
        const creatorId = req.params.creatorId;

        if (!creatorId) {
            return res.status(400).json({ message: "Missing Creator ID" });
        };
        const creatorHelpRequest = await HelpCenter.findAll({
            where: {
                creatorId: creatorId
            }
        });
        res.status(200).json({ creatorHelpRequest });

    } catch (error) {
        console.error("Error fetching creator help requests:", error);
        res.status(500).json({ error: "Internal server error" });
    };
};


const sendFeedback = async (req, res) => {
    try {
        const { requestId, subject, message } = req.body;

        if (!requestId || !subject || !message) {
            return res.status(400).send({ error: 'requestId, subject, and message are required' });
        }

        const helpRequest = await HelpCenter.findByPk(requestId, {
            include: [
                {
                    model: EndUser,
                    attributes: ['username', 'email']
                },
                {
                    model: Creator,
                    attributes: ['organizationName']
                }
            ]
        })
        if (!helpRequest || !helpRequest.EndUser || !helpRequest.EndUser.email) {
            return res.status(404).send({ error: 'Valid help request with email not found' });
        }


        const { username } = helpRequest.EndUser;
        const email = helpRequest.EndUser.email;
        const { reason, message: originalMessage } = helpRequest;
        const organizationName = helpRequest.Creator ? helpRequest.Creator.organizationName : 'Your Organization';

        //console.log(`Sending feedback email to: ${email}`);

        await sendHelpRequestFeedback({
            requestId: requestId,
            username,
            email,
            subject,
            reason,
            message,
            organizationName
        });

        res.status(200).send({ message: 'Help request feedback email sent successfully' });
    } catch (error) {
        console.error('Error sending feedback email:', error);
        res.status(500).send({ error: 'An error occurred while sending the feedback email' })
    }
}

module.exports = {
    userHelpCenter,
    getAllHelpRequest,
    helpRequestCompleted,
    getHelpRequestByEcosystem,
    sendFeedback,
    getCreatorHelpRequest,
    getAnEcosystemUserHelpRequest
}