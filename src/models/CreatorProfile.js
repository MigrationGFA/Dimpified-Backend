const mongoose = require("mongoose");

const creatorProfileSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
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

module.exports = mongoose.model("CreatorProfile", creatorProfileSchema);
