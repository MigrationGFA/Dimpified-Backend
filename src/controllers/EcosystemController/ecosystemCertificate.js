const Certificate = require("../../models/Certificate");
const Course = require("../../models/Course");
const path = require("path")

const createEcoCertificate = async (req, res) => {
    try {
        const {
            certificateNumber,
            title,
            courseId,
            ecosystemId,
            description,
            summary,
            signature,
            skills,
            issuerName,
            issuerTitle,
            // logoUrl,
            // backgroundImageUrl,
        } = req.body


        const requiredFields = [
            "certificateNumber",
            "title",
            "courseId",
            "ecosystemId",
            "description",
            "summary",
            "signature",
            "issuerName",
            "issuerTitle",
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

        // Get the file paths from Multer
        const logoUrl = req.files['logoUrl'] ? req.files['logoUrl'][0].path : null;
        const backgroundImageUrl = req.files['backgroundImageUrl'] ? req.files['backgroundImageUrl'][0].path : null;


        const newCertificate = await Certificate.create({
            certificateNumber,
            title,
            courseId,
            ecosystemId,
            description,
            summary,
            signature,
            skills,
            issuerName,
            issuerTitle,
            logoUrl,
            backgroundImageUrl,
        });

        res.status(201).json({ newCertificate })
    } catch (error) {
        console.error('Error creating certificate:', error);
        res.status(500).send({ error: 'An error occurred while creating certificate' })
    }
}

module.exports = createEcoCertificate