const mongoose = require("mongoose");

// Define the package schema
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  price: { type: Number, required: true },
  homePrice: { type: Number, required: false },
  deliveryTime: { type: String, required: true },
  priceFormat: { type: String, required: true },
  serviceImage: { type: String, required: true },
});

const ecosystemServiceSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    header: { type: String, required: true },
    description: { type: String, required: true },
    creatorId: { type: String, required: true },
    ecosystemDomain: { type: String, required: true },
    likes: { type: Number, default: 0 },
    format: { type: String, required: true },
    currency: { type: String, required: true },
    services: [packageSchema],
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("ecosystemService", ecosystemServiceSchema);

module.exports = Service;
