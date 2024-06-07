const Ecosystem = require("../models/Ecosystem");
const Creator = require("../../models/Creator");

const aboutEcosystem = async (req, res) => {
  const {
    userId,
    ecosystemName,
    ecosystemDomain,
    targetAudienceSector,
    mainObjective,
    expectedAudienceNumber,
    experience,
    ecosystemDescription,
    ecosystemId,
  } = req.body;

  try {
    let ecosystem;
    if (ecosystemId) {
      ecosystem = await Ecosystem.findByIdAndUpdate(
        ecosystemId,
        {
          userId,
          ecosystemName,
          ecosystemDomain,
          targetAudienceSector,
          mainObjective,
          expectedAudienceNumber,
          experience,
          ecosystemDescription,
          status: "draft",
          updatedAt: Date.now(),
        },
        { new: true }
      );
    } else {
      ecosystem = new Ecosystem({
        userId,
        ecosystemName,
        ecosystemDomain,
        targetAudienceSector,
        mainObjective,
        expectedAudienceNumber,
        experience,
        ecosystemDescription,
        status: "draft",
      });
      await ecosystem.save();
    }

    res
      .status(201)
      .json({ message: "Ecosystem about information saved", ecosystem });
  } catch (error) {
    console.error("Error saving ecosystem about information:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const ecosystemTemplate = async (req, res) => {
  const { ecosystemId, template } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        template,
        status: "draft",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Template saved", ecosystem });
  } catch (error) {
    console.error("Error saving template:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const ecosystemForm = async (req, res) => {
  const { ecosystemId, form } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        form,
        status: "draft",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Form saved", ecosystem });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const ecosystemCourse = async (req, res) => {
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

const ecosystemIntegration = async (req, res) => {
  const { ecosystemId, integration } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        integration,
        status: "draft",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Integration saved", ecosystem });
  } catch (error) {
    console.error("Error saving integration:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const ecosystemCompleted = async (req, res) => {
  const { ecosystemId } = req.body;

  try {
    const ecosystem = await Ecosystem.findByIdAndUpdate(
      ecosystemId,
      {
        status: "completed",
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({ message: "Ecosystem completed", ecosystem });
  } catch (error) {
    console.error("Error completing ecosystem:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports = {
  aboutEcosystem,
  ecosystemTemplate,
  ecosystemForm,
  ecosystemCourse,
  ecosystemIntegration,
  ecosystemCompleted,
};
