const mongoose = require("mongoose");

const dimpifiedTemplateSchema = new mongoose.Schema({
  creatorId: {
    type: String,
    required: true,
  },
});
