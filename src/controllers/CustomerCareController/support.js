const HelpCenter = require("../../models/HelpCenter");
const CreatorSupport = require("../../models/Support");
const User = require("../../models/Users");

const creatorSupport = async (req, res) => {
    await CreatorSupport.sync()
    try {
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
            attributes: [['username', 'email']]
        })
        res.status(200).json({ allSupportRequest })
    } catch (error) {
        console.error('Cannot find any support request', error);
        res.status(500).json({ message: "Internal Server Error", detail: error })
    }
}

module.exports = { creatorSupport, getAllSupportRequest }