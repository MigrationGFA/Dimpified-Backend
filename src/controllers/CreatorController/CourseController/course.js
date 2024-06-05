const Course = require("../../models/Course");
const Enrollment = require("../../models/Enrollment");
const Instructor = require("../../models/Instructor");
const cloudinary = require("cloudinary").v2;
const User = require("../../models/Users");
const transaction = require("../../models/Transaction");
const sendCourseCreationEmail = require("../../utils/sendCourseCreation");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const createCourse = async (req, res) => {
  const {
    Agent,
    username,
    InstructorImage,
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

  const details = [
    "title",
    "category",
    "level",
    "description",
    "courseType",
    "status",
    "Agent",
    "username",
    "currency",
    "InstructorImage",
    "price",
    "hour",
  ];

  for (const detail of details) {
    if (!req.body[detail]) {
      return res.status(400).json({ msg: `${detail} is required` });
    }
  }
  // change value back to string
  const curriculumData = JSON.parse(curriculum);
  const requirementData = JSON.parse(requirement);
  const whatisIncludedData = JSON.parse(whatIsIncluded);
  //to check if course is an array
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
    return res
      .status(400)
      .json({ message: "Please provide all the required field." });
  }
  try {
    // Upload image

    let imageLink;

    if (req.file) {
      const imageUpload = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "image",
      });
      imageLink = imageUpload.secure_url;
    }

    let instructor = await Instructor.findOne({ instructorId: Agent });

    if (!instructor) {
      console.log("the problemis instructor");
      instructor = await Instructor.create({
        instructorId: Agent,
        username,
        InstructorImage,
      });
      console.log("the problem is not instructor");
    } else {
      instructor.InstructorImage = InstructorImage;
      await instructor.save();
    }

    const course = await Course.create({
      title,
      category,
      level,
      description,
      courseType,
      price,
      hour,
      curriculum: curriculumData,
      // courseContent: courseContentLink,
      requirement: requirementData,
      status,
      currency,
      whatIsIncluded: whatisIncludedData,
      image: imageLink,
      Agent: instructor._id,
    });

    await Instructor.findByIdAndUpdate(instructor._id, {
      $push: { created_courses: course._id },
    });
    await sendCourseCreationEmail({
      username: instructor.username,
      email: "makindesamuel1999@gmail.com",
      title: course.title,
      price: course.price,
      category: course.category,
      hour: course.price,
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Internal server error", error });
  }
};

module.exports = createCourse;
