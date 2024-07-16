const mongoose = require("mongoose");

// const packageSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   shortDescription: { type: String, required: true },
//   price: { type: Number, required: true },
//   deliveryTime: { type: String, required: true },
//   priceFormat: { type: String, required: true },
// });

const digitalProductSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    productName: { type: String, required: true },
    productType: [{ type: String, required: true }],
    description: { type: String, required: true },
    creatorId: { type: String, required: true },
    ecosystemDomain: { type: String, required: true },
    fileType: [{ type: String, required: true }],
    backgroundCover: [{ type: String, required: true }],
    likes: { type: Number, default: 0 },
    downloadUrl: { type: String },
    currency: { type: String, required: true },
    price: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const DigitalProduct = mongoose.model(
  "DimpifiedDigitalProduct",
  digitalProductSchema
);

module.exports = DigitalProduct;
