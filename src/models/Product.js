const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // Add other service-specific fields here
});

module.exports = mongoose.model("DimpifiedProducts", productSchema);
