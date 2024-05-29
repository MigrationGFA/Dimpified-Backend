const HelpCenter = require("../../models/HelpCenter");
const User = require("../../models/Users");
const sendSupportRequestCompletedEmail = require("../../utils/supportRequestCompleted");


const userHelpCenter = async (req, res) => {
    await HelpCenter.sync()
    try {
        const { userId,
            //role,
            reason,
            message,
            creatorId,
            ecosystemId,
        } = req.body;
        const details = [
            "userId",
            //"role",
            "reason",
            "message",
            "creatorId",
            "ecosystemId",
        ]
        for (const detail of details) {
            if (!req.body[detail]) {
                return res.status(400).json({ message: `${detail} is required` });
            }
        }
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const createHelpRequest = await HelpCenter.create({
            userId,
            //role,
            reason,
            message,
            creatorId,
            ecosystemId,
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
            attributes: ['username', 'email']
        })

        res.status(200).json({ allhelpRequest })
    } catch (error) {
        console.log('Cannot find any request', error);
        res.status(500).json({ message: 'Internal Server Error', detail: error });

    };
};

const helpRequestCompleted = async (res, req) => {
    try {
        const { requestId } = req.params

        const helpRequestSubmission = await HelpCenter.findByPk(requestId, {
            include: [
                {
                    model: User,
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
            username: helpRequestSubmission.User.username,
            email: helpRequestSubmission.User.email,
            helpRequestId: requestId,
            reason: helpRequestSubmission.reason,
            message: helpRequestSubmission.message,
        })
        res.status(200).json({ message: "Your help request marked completed" })
    } catch (error) {
        console.log("Error marking request completed", error)
        res.status(500).json({ message: "Internal Server error", detail: error })
    }
}

module.exports = { userHelpCenter, getAllHelpRequest, helpRequestCompleted }