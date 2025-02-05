const mongoose = require("mongoose");

const AdminNotificationSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ["general", "support", "finance", "sales"],
    required: true,
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

module.exports = mongoose.model("AdminNotification", AdminNotificationSchema);
