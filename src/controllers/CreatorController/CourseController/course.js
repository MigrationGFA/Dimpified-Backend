const Course = require("../../../models/Course");
// const Enrollment = require("../../models/Enrollment");
const Creator = require("../../../models/Creator");
const cloudinary = require("cloudinary").v2;
// const User = require("../../models/Users");
// const transaction = require("../../models/Transaction");
const mongoose = require("mongoose");
const sendCourseCreationEmail = require("../../../utils/sendCourseCreation");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const createCourse = async (req, res) => {
  try {
    const {
      creatorId,
      title,
      category,
      level,
      description,
      courseType,
      curriculum,
      whatIsIncluded,
      requirement,
      status,
      price,
      hour,
      currency,
    } = req.body;

    // Required fields validation
    const requiredFields = [
      "title",
      "category",
      "level",
      "description",
      "courseType",
      "status",
      "price",
      "hour",
      "currency",
      "creatorId",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ msg: `${field} is required` });
      }
    }

    // Parsing JSON fields
    let curriculumData, requirementData, whatIsIncludedData;
    try {
      curriculumData = JSON.parse(curriculum);
      requirementData = JSON.parse(requirement);
      whatIsIncludedData = JSON.parse(whatIsIncluded);
    } catch (parseError) {
      return res.status(400).json({ msg: "Invalid JSON format in request" });
    }

    // Validate parsed arrays
    if (
      !Array.isArray(curriculumData) ||
      curriculumData.length === 0 ||
      !Array.isArray(whatIsIncludedData) ||
      whatIsIncludedData.length === 0 ||
      !Array.isArray(requirementData) ||
      requirementData.length === 0
    ) {
      return res.status(400).json({
        msg: "Invalid data in curriculum, whatIsIncluded, or requirement fields",
      });
    }

    // Upload image if provided
    let imageLink;
    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      imageLink = imageUpload.secure_url;
    }

    // Create the course
    const course = await Course.create({
      creatorId,
      title,
      category,
      level,
      description,
      courseType,
      price,
      hour,
      curriculum: curriculumData,
      requirement: requirementData,
      status,
      currency,
      whatIsIncluded: whatIsIncludedData,
      image: imageLink,
    });

    // Send course creation email
    const creator = await Creator.findByPk(creatorId);
    if (creator) {
      await sendCourseCreationEmail({
        organizationName: creator.organizationName,
        email: creator.email,
        title: course.title,
        price: course.price,
        category: course.category,
        hour: course.hour,
      });
    }

    // Respond with success
    res.status(201).json({ msg: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ msg: "Internal server error", error });
  }
};

module.exports = createCourse;
