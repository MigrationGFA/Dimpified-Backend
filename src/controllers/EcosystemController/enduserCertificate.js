const Certificate = require("../../models/Certificate");
//const Course = require("../../models/Course");
const EndUserCertificate = require("../../models/EndUserCertificate");
const generatePDF = require("../../utils/pdfGenerator");
const sendUserCertificate = require("../../utils/sendUserCertficateEmail");
//const generateCertificate = require("../../utils/generateCertificate")


const generateUserCertificate = async (req, res) => {

    try {
        const {

            userid,
            courseId,
            recipientName,
            recipientEmail,
            ecosystemId
        } = req.body
        const startTime = Date.now();

        const requiredFields = [
            "userid",
            "courseId",
            "recipientName",
            "recipientEmail",
            "ecosystemId"
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
            return res.status(200).json({ message: "certificate not found" })
        };

        const userCertificate = new EndUserCertificate({
            certificateNumber: ecosystemCertificate.certificateNumber,
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

        const pdfData = {
            title: ecosystemCertificate.title,
            recipientName,
            certificateNumber: ecosystemCertificate.certificateNumber,
            skills: ecosystemCertificate.skills,
            Date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        };

        const pdfBuffer = await generatePDF(pdfData);

        await sendUserCertificate({ recipientName, recipientEmail, pdfBuffer });

        //await sendUserCertificate({ recipientName, recipientEmail, pdfBuffer });
        res.status(201).json({ userCertificate })
    } catch (error) {
        console.error('Error generating certificate:', error);
        res.status(500).send({ error: 'An error occurred while generating certificate' })
    }
}

module.exports = generateUserCertificate