const mongoose = require("mongoose");

const creatorProfileSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
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
