const mongoose = require("mongoose");

const EcosystemSignUp = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Professional Services",
        "Creative Services",
        "Trade Services",
        "Personal Care Services",
        "Educational Services",
        "Event Services",
        "Technology Services",
        "Government",
        "Corporations",
        "Foundation/NGO's",
        "Religious Bodies",
      ],
    },
    location: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    profilePicture: {
      type: String, // URL or file path to image
    },
    categorySpecificDetails: {
      industrySpecialization: { type: String }, // For Professional Services
      certification: { type: String }, // For Professional Services
      yearsOfExperience: { type: Number }, // For Professional Services
      officeAddress: { type: String }, // For Professional Services

      creativePortfolio: { type: String }, // For Creative Services

      tradeLicenseNumber: { type: String }, // For Trade Services
      tradeSpecialization: { type: String }, // For Trade Services

      personalCareLicense: { type: String }, // For Personal Care Services

      educationSpecialization: { type: String }, // For Educational Services
      degree: { type: String }, // For Educational Services

      eventServicesPortfolio: { type: String }, // For Event Services

      techSkills: { type: String }, // For Technology Services
      certifications: { type: String }, // For Technology Services

      governmentId: { type: String }, // For Government
      governmentRole: { type: String }, // For Government

      corporationId: { type: String }, // For Corporations
      companyPosition: { type: String }, // For Corporations

      ngoId: { type: String }, // For Foundation/NGO's
      ngoRole: { type: String }, // For Foundation/NGO's

      religiousRole: { type: String }, // For Religious Bodies
      churchOrganization: { type: String }, // For Religious Bodies
    },
    termsAccepted: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EcosystemSignUp", EcosystemSignUp);
