const Certificate = require("../../models/Certificate");
const Course = require("../../models/Course");

const createEcoCertificate = async (req, res) => {
    try {
        const { title,
            courseId,
            signature,
            skills,
            issuerName,
            issuerTitle,
            logoUrl,
            backgroundImageUrl } = req.body


        const requiredFields = [
            "title",
            "courseId",
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

        const newCertificate = await Certificate.create({
            title,
            course: courseId,
            signature,
            skills,
            issuerName,
            issuerTitle,
            logoUrl,
            backgroundImageUrl,
        })
        newCertificate.save()

        res.status(201).json({ newCertificate })
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(500).send({ error: 'An error occurred while creating certificate' })
    }
}

module.exports = createEcoCertificate