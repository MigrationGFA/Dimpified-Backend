const mongoose = require("mongoose");

const dimpifiedNotification = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
   creator: {
    type: Number,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed"],
    default: "pending",
  },
});

const Notification = mongoose.model("dimpifiedNotification", dimpifiedNotification);

module.exports = Notification;

