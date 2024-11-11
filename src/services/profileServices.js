const CreatorProfile = require("../models/CreatorProfile");

exports.getProfileDetails = async (params) => {
  const { creatorId } = params;
  const creatorProfile = await CreatorProfile.findOne({ creatorId });
  if (!creatorProfile) {
    return { status: 404, data: { message: "creator not found" } };
  }

  const profile = {
    fullname: creatorProfile.fullName,
    dateOfBirth: creatorProfile.dateOfBirth,
    gender: creatorProfile.gender,
    phoneNumber: creatorProfile.phoneNumber,
    localGovernment: creatorProfile.localGovernment || "",
    state: creatorProfile.state || "",
    country: creatorProfile.country || "",
    profileImage: creatorProfile.image,
  };

  return { status: 200, data: { profile } };
};

exports.editProfileDetails = async (body) => {
  const { creatorId } = body;

  const updatedProfile = await CreatorProfile.findOneAndUpdate(
    { creatorId },
    {
      $set: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.dateOfBirth && { dateOfBirth: body.dateOfBirth }),
        ...(body.gender && { gender: body.gender }),
        ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
        ...(body.localGovernment && { localGovernment: body.localGovernment }),
        ...(body.state && { state: body.state }),
        ...(body.country && { country: body.country }),
      },
    },
    { new: true }
  );

  if (!updatedProfile) {
    return { status: 404, data: { message: "Creator not found" } };
  }

  return {
    status: 200,
    data: { message: "Profile updated successfully", profile: updatedProfile },
  };
};
