const mongoose = require("mongoose");

const creatorProfileSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },
  phoneNumber: { type: String, required: true },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  creatorId: {
    type: String,
    required: true,
  },
  dateOfBirth: { type: String },
  state: { type: String },
  localGovernment: { type: String },
  country: { type: String },
  image: {
    type: String,
  },
  ecosystemIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ecosystem",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const CreatorProfile = mongoose.model("CreatorProfile", creatorProfileSchema);

module.exports = CreatorProfile
