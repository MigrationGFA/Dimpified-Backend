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

// const createCourse = async (req, res) => {
//   try {
//     const {
//       creatorId,
//       title,
//       category,
//       level,
//       description,
//       courseType,
//       curriculum,
//       whatIsIncluded,
//       requirement,
//       price,
//       hour,
//       currency,
//     } = req.body;

//     // Required fields validation
//     const requiredFields = [
//       "category",
//       "title",
//       "level",
//       "description",
//       "courseType",
//       "price",
//       "hour",
//       "currency",
//       "creatorId",

//     ];

//     for (const field of requiredFields) {
//       if (!req.body[field]) {
//         return res.status(400).json({ message: `${field} is required` });
//       }
//     }

//         // Parsing JSON fields
//     let curriculumData, requirementData, whatisIncludedData;

//       curriculumData = JSON.parse(curriculum);
//       requirementData = JSON.parse(requirement);
//       whatisIncludedData = JSON.parse(whatIsIncluded);
//     // Validate parsed arrays
//     console.log("This is what is included", whatisIncludedData)
//     console.log("This is what is included", requirementData)
//     console.log("This is what is included", curriculumData)

//     if (
//        !curriculumData ||
//     !whatisIncludedData ||
//     !requirementData ||
//     !Array.isArray(curriculumData) ||
//     curriculumData.length === 0 ||
//     !Array.isArray(whatisIncludedData) ||
//     whatisIncludedData.length === 0 ||
//     !Array.isArray(requirementData) ||
//     requirementData.length === 0
//     ) {
//       return res.status(400).json({
//         message: "Invalid data in curriculum, whatIsIncluded, or requirement fields",
//       });
//     }

//     // Upload image if provided
//     let imageLink;
//     if (req.file) {
//       const imageUpload = await cloudinary.uploader.upload(req.file.path, {
//         resource_type: "image",
//       });
//       imageLink = imageUpload.secure_url;
//     }

//     // Create the course
//     const course = await Course.create({
//       creatorId,
//       title,
//       category,
//       level,
//       description,
//       courseType,
//       price,
//       hour,
//       curriculum: curriculumData,
//       requirement: requirementData,
//       currency,
//       whatIsIncluded: whatisIncludedData,
//       image: imageLink,
//     });

//     // Send course creation email
//     const creator = await Creator.findByPk(creatorId);
//     if (creator) {
//       await sendCourseCreationEmail({
//         organizationName: creator.organizationName,
//         email: creator.email,
//         title: course.title,
//         price: course.price,
//         category: course.category,
//         hour: course.hour,
//       });
//     }

//     // Respond with success
//     res.status(201).json({ message: "Course created successfully", course });
//   } catch (error) {
//     console.error("Error creating course:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };

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
      price,
      hour,
      currency,
      ecosystemId,
    } = req.body;

    // Required fields validation
    const requiredFields = [
      "creatorId",
      "category",
      "title",
      "level",
      "description",
      "courseType",
      "price",
      "hour",
      "currency",
      "ecosystemId",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    // Parsing JSON fields
    let curriculumData, requirementData, whatisIncludedData;

    curriculumData = JSON.parse(curriculum);
    requirementData = JSON.parse(requirement);
    whatisIncludedData = JSON.parse(whatIsIncluded);

    // Validate parsed arrays
    if (
      !curriculumData ||
      !whatisIncludedData ||
      !requirementData ||
      !Array.isArray(curriculumData) ||
      curriculumData.length === 0 ||
      !Array.isArray(whatisIncludedData) ||
      whatisIncludedData.length === 0 ||
      !Array.isArray(requirementData) ||
      requirementData.length === 0
    ) {
      return res.status(400).json({
        message:
          "Invalid data in curriculum, whatIsIncluded, or requirement fields",
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
      currency,
      whatIsIncluded: whatisIncludedData,
      image: imageLink,
    });

    // Add the course to the ecosystem
    const ecosystem = await Ecosystem.findById(ecosystemId);
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    ecosystem.courses.push(course._id);
    await ecosystem.save();

    // Add the course to the creator profile
    const creatorProfile = await CreatorProfile.findOne({ _id: creatorId });
    if (!creatorProfile) {
      return res.status(404).json({ message: "Creator profile not found" });
    }
    creatorProfile.courses.push(course._id);
    await creatorProfile.save();

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
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = createCourse;
