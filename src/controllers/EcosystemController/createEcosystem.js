const Ecosystem = require("../../models/Ecosystem");
const Creator = require("../../models/Creator");
const dimpifiedCourse = require("../../models/Course");

const aboutEcosystem = async (req, res) => {
  const {
    creatorId,
    ecosystemName,
    ecosystemDomain,
    targetAudienceSector,
    mainObjective,
    expectedAudienceNumber,
    experience,
    ecosystemDescription,
    ecosystemId,
  } = req.body;

  const requiredFields = [
    "creatorId",
    "ecosystemName",
    "ecosystemDomain",
    "targetAudienceSector",
    "mainObjective",
    "expectedAudienceNumber",
    "experience",
    "ecosystemDescription",
    "ecosystemId"
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `${field} is required` });
    }
  }

  try {
    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    let ecosystem;
    if (ecosystemId !== "null") {
      ecosystem = await Ecosystem.findByIdAndUpdate(
        ecosystemId,
        {
          creatorId,
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
        creatorId,
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

    return res
      .status(201)
      .json({ message: "Ecosystem about information saved", ecosystem });
  } catch (error) {
    console.error("Error saving ecosystem about information:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Endpoint to handle ecosystem template information
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

// Endpoint to handle ecosystem form information
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

// Endpoint to handle ecosystem integration information
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

// Endpoint to handle ecosystem completion
const ecosystemCompleted = async (req, res) => {
  const { ecosystemId } = req.body;

  try {
    const ecosystem = await Ecosystem.findById(ecosystemId);

    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    // Check if all required fields are filled
    const requiredFields = [
      "ecosystemName",
      "ecosystemDomain",
      "targetAudienceSector",
      "mainObjective",
      "expectedAudienceNumber",
      "experience",
      "ecosystemDescription",
      "template",
      "form",
      "courses",
      "integration",
    ];

    for (const field of requiredFields) {
      if (
        !ecosystem[field] ||
        (Array.isArray(ecosystem[field]) && ecosystem[field].length === 0)
      ) {
        return res.status(400).json({
          message: `Field ${field} is required to complete the ecosystem`,
        });
      }
    }

    ecosystem.status = "completed";
    ecosystem.updatedAt = Date.now();
    await ecosystem.save();

    res.status(200).json({ message: "Ecosystem completed", ecosystem });
  } catch (error) {
    console.error("Error completing ecosystem:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

//Endpoint to get all courses for an ecosystem
const allEcosystemCourses = async (req, res) => {
  try {
    const ecosystemId = req.params.ecosystemId
    if (!ecosystemId) {
      res.status(404).json({ message: "Ecosystem ID is required" })
    }

    const ecosystemCourses = await Ecosystem.findById(ecosystemId).populate("courses")

    if (!ecosystemCourses) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    res.status(200).json({ ecosystemCourses: ecosystemCourses.courses });
  } catch (error) {
    console.error("error retrieving all ecosystem courses:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


//Endponit to get a particular course
const getAnEcosystemCourse = async (req, res) => {
  try {
    const { ecosystemId, courseId } = req.params;
    if (!ecosystemId || !courseId) {
      res.status(404).json({ message: "Ecosystem ID and course ID is required" })
    };

    //find ecosystem by ID
    const ecosystem = await Ecosystem.findById(ecosystemId);

    //check if course is part of ecosystem courses
    if (!ecosystem.courses.includes(courseId)) {
      return res.status(404).json({ message: 'Course not found in this ecosystem' });
    };

    //fetch course details
    const course = await dimpifiedCourse.findById(courseId);


    res.status(200).json({ course })
  } catch (error) {
    console.error("error retrieving courses from ecosystem: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  aboutEcosystem,
  ecosystemTemplate,
  ecosystemForm,
  ecosystemIntegration,
  ecosystemCompleted,
  allEcosystemCourses,
  getAnEcosystemCourse
};
