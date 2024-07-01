const Course = require("../../models/Course");
const EndUserCertificate = require("../../models/EndUserCertificate");

const generateUserCertificate = async (req, res) => {
    try {
        const {
            certificateNumber,
            title,
            userid,
            courseId,
            recipientName,
            recipientEmail,
            description,
            signature,
            skills,
            issuerName,
            issuerTitle,
            logoUrl,
            backgroundImageUrl } = req.body


        const requiredFields = [
            "certificateNumber",
            "title",
            "userid",
            "courseId",
            "recipientName",
            "recipientEmail",
            "description",
            "signature",
            "issuerName",
            "issuerTitle",
            "logoUrl",
            "backgroundImageUrl",
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        //Check if course exist
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        };

        const newUserCertificate = await EndUserCertificate.create({
            certificateNumber,
            title,
            userid,
            courseId,
            recipientName,
            recipientEmail,
            description,
            signature,
            skills,
            issuerName,
            issuerTitle,
            logoUrl,
            backgroundImageUrl
        });

        res.status(201).json({ newUserCertificate })
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(500).send({ error: 'An error occurred while creating certificate' })
    }
}

module.exports = generateUserCertificate