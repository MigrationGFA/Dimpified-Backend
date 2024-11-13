const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    required: true,
  },
  view: {
    type: Boolean,
    default: false,
  },
  ecosystemDomain: {
    type: String,
    required: true,
  },
  creatorId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
