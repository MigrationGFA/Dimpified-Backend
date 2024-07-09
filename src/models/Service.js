const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // Add other service-specific fields here
});

module.exports = mongoose.model("DimpifiedService", serviceSchema);
