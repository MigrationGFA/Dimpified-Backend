const mongoose = require("mongoose");

const DimpifiedTeamMemberSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true
    },
    fullName: { type: String, required: true},
    phoneNumber: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    ecosystemDomain: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
      ref: "Creator",
    },
    services: {
      type: [String], // Array of service IDs
      required: true,
    },
    status: {
      type: String,
      default: "active",
      enum: ["active", "deactivated"],
    },
    dateOfBirth: String,
    state: String,
    localGovernment: String,
    address: String,
    country: String,
  },
  { timestamps: true }
);

const DimpifiedTeamMember = mongoose.model(
  "DimpifiedTeamMember",
  DimpifiedTeamMemberSchema
);
module.exports = DimpifiedTeamMember;
