const mongoose = require("mongoose");

const dimpifiedCourseSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    ecosystemId: {
      type: String,
      required: true,
    },
    ecosystemDomain: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    description: {
      type: String,
      required: true,
    },
    image: String,
    courseType: {
      type: String,
      required: true,
      enum: ["video", "audio", "document"],
    },
    hour: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    whatIsIncluded: {
      type: [String],
      default: [],
    },
    curriculum: [
      {
        courseName: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        totalDuration: {
          type: String,
          required: true,
        },
        section: [
          {
            title: {
              type: String,
              required: true,
            },
            link: {
              type: String,
              required: true,
            },
            duration: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],
    requirement: [
      {
        name: String,
      },
    ],
    totalNumberOfEnrolledStudent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "live", "rejected"],
      default: "pending",
    },
    currency: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("dimpifiedCourse", dimpifiedCourseSchema);
