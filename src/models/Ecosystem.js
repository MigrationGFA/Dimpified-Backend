const mongoose = require("mongoose");

const ecosystemSchema = new mongoose.Schema({
  creatorId: {
    type: Number,
    required: true,
  },
  ecosystemName: {
    type: String,
    required: true,
  },
  ecosystemDomain: {
    type: String,
    required: true,
  },
  targetAudienceSector: {
    type: String,
    required: true,
  },
  mainObjective: {
    type: String,
    required: true,
  },
  expectedAudienceNumber: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  ecosystemDescription: {
    type: String,
    required: true,
  },
  template: {
    type: String,
    default: "",
  },
  form: {
    type: String,
    default: "",
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dimpifiedCourse",
    },
  ],
  integration: {
    type: Array,
    default: [],
  },
  status: {
    type: String,
    enum: ["draft", "pending", "live"],
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Ecosystem", ecosystemSchema);