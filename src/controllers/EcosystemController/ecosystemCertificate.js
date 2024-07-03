const Certificate = require("../../models/Certificate");
const Course = require("../../models/Course");
//const cloudinary = require("cloudinary").v2;

// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.API_KEY,
//     api_secret: process.env.API_SECRET,
//     secure: true,
// });


const createEcoCertificate = async (req, res) => {
    try {
        const {
            certificateNumber,
            title,
            courseId,
            description,
            summary,
            signature,
            skills,
            issuerName,
            issuerTitle,
        } = req.body


        const requiredFields = [
            "certificateNumber",
            "title",
            "courseId",
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


        // let logoUrl, backgroundImageUrl;
        // if (req.file) {
        //     const fileUpload = await cloudinary.uploader.upload(req.file.path, {
        //         resource_type: "auto",
        //     });
        //     logoUrl = fileUpload.secure_url;
        //     backgroundImageUrl = fileUpload.secure_url;
        // }


        //Check if course exist
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        };



        const newCertificate = await Certificate.create({
            certificateNumber,
            title,
            courseId,
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