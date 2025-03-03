const Creator = require("../models/Creator");
const CreatorProfile = require("../models/CreatorProfile");
const Ecosystem = require("../models/Ecosystem");

exports.getProfileDetails = async (params) => {
  const { creatorId } = params;
  const creatorProfile = await CreatorProfile.findOne({ creatorId });
  if (!creatorProfile) {
    return { status: 404, data: { message: "creator not found" } };
  }

  const ecosystem = await Ecosystem.findOne({ creatorId });
  if (!ecosystem) {
    return { status: 404, data: { message: "ecosystem not found" } };
  }

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "creator not found" } };
  }

  const profile = {
    fullname: creatorProfile.fullName,
    email: creatorProfile.email,
    dateOfBirth: creatorProfile.dateOfBirth,
    gender: creatorProfile.gender,
    ecosystemDomain: ecosystem.ecosystemDomain,
    phoneNumber: creatorProfile.phoneNumber,
    localGovernment: ecosystem.localgovernment || "",
    state: ecosystem.state || "",
    country: ecosystem.country || "",
    profileImage: creatorProfile.image || "",
    subCategory: ecosystem.mainObjective,
    description: ecosystem.ecosystemDescription,
    businessName: ecosystem.organizationName,
    category: ecosystem.targetAudienceSector,
   
  };

  console.log("profile:", creatorProfile);
  return { status: 200, data: { profile } };
};

exports.editProfileDetails = async (body) => {
  try {
    const {
      creatorId,
      fullName,
      dateOfBirth,
      gender,
      phoneNumber,
      localGovernment,
      state,
      country,
      profileImage,
      category,
      description,
      businessName,
    } = body;

    if (!creatorId) {
      return { status: 400, data: { message: "Creator ID is required" } };
    }

    // Update CreatorProfile and ensure fullName is correctly set
    const updatedProfile = await CreatorProfile.findOneAndUpdate(
      { creatorId },
      {
        $set: {
          fullName: fullName || undefined, // Ensures fullName is updated even if empty
          dateOfBirth: dateOfBirth || undefined,
          gender: gender || undefined,
          phoneNumber: phoneNumber || undefined,
          localGovernment: localGovernment || undefined,
          state: state || undefined,
          country: country || undefined,
          image: profileImage || undefined,
        },
      },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedProfile) {
      return { status: 404, data: { message: "Creator profile not found" } };
    }

    // Update Ecosystem details if applicable
    const updatedEcosystem = await Ecosystem.findOneAndUpdate(
      { creatorId },
      {
        $set: {
          ecosystemDescription: description || undefined,
          businessName: businessName || undefined,
        },
      },
      { new: true }
    );

    // Update Creator category interest
    const updatedCreator = await Creator.findByPk(creatorId);
    if (updatedCreator && category) {
      await updatedCreator.update({ categoryInterest: category });
    }

    // Consolidate updated profile data into one response body
    const updatedData = {
      fullName: updatedProfile.fullName, // Ensuring fullName is correctly retrieved
      dateOfBirth: updatedProfile.dateOfBirth,
      gender: updatedProfile.gender,
      phoneNumber: updatedProfile.phoneNumber,
      localGovernment: updatedProfile.localGovernment || "",
      state: updatedProfile.state || "",
      country: updatedProfile.country || "",
      profileImage: updatedProfile.image,
      category: updatedCreator?.categoryInterest || "",
      description: updatedEcosystem?.ecosystemDescription || "",
      businessName: updatedEcosystem?.businessName || "",
    };

    return {
      status: 200,
      data: {
        message: "Profile updated successfully",
        profile: updatedData,
      },
    };
  } catch (error) {
    return {
      status: 500,
      data: { message: "Internal server error", error: error.message },
    };
  }
};
