const Course = require("../../../models/Course");
const Creator = require("../../../models/Creator");
const mongoose = require("mongoose");
const sendCourseCreationEmail = require("../../../utils/sendCourseCreation");
const Ecosystem = require("../../../models/Ecosystem");

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

    let imageLink;
    if (req.file) {
      imageLink = `https://dimpified-backend-development.azurewebsites.net/${req.file.path}`;
    }

    // Create the course
    const course = await Course.create({
      creatorId,
      ecosystemId,
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
    const ecoId = new mongoose.Types.ObjectId(ecosystemId);
    const ecosystem = await Ecosystem.findById(ecoId);
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    ecosystem.courses.push(course._id);
    await ecosystem.save();

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
      return res
        .status(201)
        .json({ message: "Course created successfully", course });
    } else {
      return res.status(404).json({ message: "Creator account not found" });
    }
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getEcosystemCourse = async (req, res) => {
  const ecosystemDomain = req.params.ecosystemDomain;
  if (!ecosystemDomain) {
    return res.status(404).json({ message: "Ecosystem domain is required" });
  }
  try {
    const ecosystem = await Ecosystem.findOne({
      ecosystemDomain: ecosystemDomain,
    });
    if (!ecosystem) {
      return res.status(401).json({ message: "Ecosystem not found" });
    }
    const getAllCourse = await Course.find({ ecosystemId: ecosystem._id }).sort(
      { createdAt: -1 }
    );
    return res.status(200).json({ courses: getAllCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

//Endpoint to get a particular course
const getAnEcosystemCourseDetails = async (req, res) => {
  try {
    const { ecosystemDomain, courseId } = req.params;
    if (!ecosystemDomain || !courseId) {
      return res
        .status(404)
        .json({ message: "Ecosystem domain and course ID is required" });
    }

    //find ecosystem by ID
    const ecosystem = await Ecosystem.findOne({
      ecosystemDomain: ecosystemDomain,
    });

    //check if course is part of ecosystem courses
    if (!ecosystem.courses.includes(courseId)) {
      return res
        .status(404)
        .json({ message: "Course not found in this ecosystem" });
    }

    //fetch course details
    const course = await Course.findById(courseId);

    return res.status(200).json({ course });
  } catch (error) {
    console.error("error retrieving courses from ecosystem: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCourse,
  getEcosystemCourse,
  getAnEcosystemCourseDetails,
};