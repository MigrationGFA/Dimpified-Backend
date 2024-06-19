const Creator = require("../../models/Creator");
//const HelpCenter = require("../../models/HelpCenter");
const CreatorSupport = require("../../models/Support");
const sendCreatorSupportRequestFeedback = require("../../utils/sendCreatorSupportFeedbackEmail");
//const sendHelpRequestFeedback = require("../../utils/sendHelpRequestFeedback");
const sendSupportRequestCompletedEmail = require("../../utils/supportRequestCompleted");



const creatorSupport = async (req, res) => {
    try {
        await CreatorSupport.sync()
        const { reason, message, creatorId } = req.body;
        const details = [
            "reason",
            "message",
            "creatorId"
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }
        const creator = await Creator.findByPk(creatorId)
        if (!creator) {
            return res.status(404).json({ message: "creator not found" })
        }

        const createSupport = await CreatorSupport.create({
            reason,
            message,
            creatorId
        })
        return res.status(201).json({
            message: "Your Support Request has been sent",
            data: createSupport
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error", detail: error })

    }
};

const getAllSupportRequest = async (req, res) => {
    try {
        const allSupportRequest = await CreatorSupport.findAll({

            order: [['createdAt', 'DESC']],
            include: {
                model: Creator,
                attributes: ["organizationName", "imageUrl", "email"],
            },

        })
        res.status(200).json({ allSupportRequest })
    } catch (error) {
        console.error('Cannot find any support request', error);
        res.status(500).json({ message: "Internal Server Error", detail: error })
    }
};

const getSupportRequestByACreator = async (req, res) => {
    try {
        const creatorId = req.params.creatorId
        if (!creatorId) {
            return res.status(400).json({ message: "Missing creator ID" });
        }

        const supportRequestByCreator = await CreatorSupport.findAll({
            where: {
                creatorId: creatorId,
            },
            order: [["createdAt", "DESC"]],
        })
        res.status(200).json({ supportRequestByCreator })
    } catch (error) {
        console.error("Error fetching a creator support requests: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const supportRequestCompleted = async (req, res) => {
    try {
        const { requestId } = req.params
        if (!requestId) {
            return res.status(400).json({ message: "Missing request ID" });
        }

        const supportRequestSubmission = await CreatorSupport.findByPk(requestId, {
            include: [
                {
                    model: Creator,
                    attributes: ['organizationName', 'email']
                }
            ]
        })
        if (!supportRequestSubmission) {
            return res.status(404).json({ message: "Support Request submission not found" })
        }
        await supportRequestSubmission.update(
            { status: "completed" },
            { where: { id: requestId } }

        );
        await sendSupportRequestCompletedEmail({
            username: supportRequestSubmission.Creator.username,
            email: supportRequestSubmission.Creator.email,
            supportRequestId: requestId,
            reason: supportRequestSubmission.reason,
            message: supportRequestSubmission.message,
        })
        res.status(200).json({ message: "Your help request marked completed" })
    } catch (error) {
        console.log("Error marking request completed", error)
        res.status(500).json({ message: "Internal Server error", detail: error })
    }
};

const sendSupportFeedback = async (req, res) => {
    try {
        const { requestId, subject, message } = req.body;

        if (!requestId || !subject || !message) {
            return res.status(400).send({ error: 'requestId, subject, and message are required' });
        }

        const supportRequest = await CreatorSupport.findByPk(requestId, {
            include: [
                {
                    model: Creator,
                    attributes: ['organizationName', 'email']
                }
            ]
        })
        if (!supportRequest || !supportRequest.Creator || !supportRequest.Creator.email) {
            return res.status(404).send({ error: 'Valid help request with email not found' });
        }

        //const { username } = supportRequest.EndUser;
        const email = supportRequest.Creator.email;
        const { reason, message: originalMessage } = supportRequest;
        const organizationName = supportRequest.Creator ? supportRequest.Creator.organizationName : 'Your Organization';
        // const { username, email, Message } = supportRequest;

        await sendCreatorSupportRequestFeedback({
            //supportId: requestId,
            email,
            subject,
            reason,
            message,
            organizationName
        });

        res.status(200).send({ message: 'Creator Support Request Feedback email sent successfully' });
    } catch (error) {
        console.error('Error sending feedback email:', error);
        res.status(500).send({ error: 'An error occurred while sending the feedback email' })
    }
}


module.exports = { creatorSupport, getAllSupportRequest, supportRequestCompleted, getSupportRequestByACreator, sendSupportFeedback }