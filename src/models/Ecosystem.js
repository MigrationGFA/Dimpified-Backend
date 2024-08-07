const mongoose = require("mongoose");

const ecosystemSchema = new mongoose.Schema({
  creatorId: {
    type: Number,
    required: true,
  },
  ecosystemName: {
    type: String,
    required: true,
    unique: true,
  },
  ecosystemDomain: {
    type: String,
    required: true,
  },
  ecoCertificate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dimpifiedEcoCertificate",
    },
  ],
  targetAudienceSector: {
    type: String,
    required: true,
  },
  mainObjective: {
    type: String,
    required: true,
  },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: "dimpCommunity" },
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
  templates: { type: mongoose.Types.ObjectId, ref: "Template" },
  forms: { type: mongoose.Types.ObjectId, ref: "Form" },
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
  users: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["draft", "private", "live"],
    default: "draft",
  },
  communityCreated: {
    type: String,
    enum: ["true", "false", ],
    default: "false",
  },
  steps: {
    type: Number,
    default: 0,
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
