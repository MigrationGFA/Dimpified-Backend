const Certificate = require("../../models/Certificate");
//const Course = require("../../models/Course");
const EndUserCertificate = require("../../models/EndUserCertificate");


const generateUserCertificate = async (req, res) => {
    try {
        const {

            userid,
            courseId,
            recipientName,
            recipientEmail,
            ecosystemId
        } = req.body


        const requiredFields = [
            "userid",
            "courseId",
            "recipientName",
            "recipientEmail",
            "ecosystem"
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }


        //Check if certificate exist
        const ecosystemCertificate = await Certificate.findOne({
            courseId,
            ecosystemId
        });

        if (!ecosystemCertificate) {
            return res.status(404).json({ message: "certificate not found" })
        };

        const userCertificate = new EndUserCertificate({
            certificateNumber: uuidv4(),
            userid,
            ecosystemId,
            title: ecosystemCertificate.title,
            courseId,
            recipientName,
            recipientEmail,
            description: ecosystemCertificate.description,
            signature: ecosystemCertificate.signature,
            skills: ecosystemCertificate.skills,
            issuerName: ecosystemCertificate.issuerName,
            issuerTitle: ecosystemCertificate.issuerTitle,
            logo: ecosystemCertificate.logoUrl,
            backgroundImage: ecosystemCertificate.backgroundImageUrl,
        });

        await userCertificate.save()
        res.status(201).json({ userCertificate })
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(500).send({ error: 'An error occurred while creating certificate' })
    }
}

module.exports = generateUserCertificate