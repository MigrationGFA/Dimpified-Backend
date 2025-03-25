const bcrypt = require("bcryptjs");
const Creator = require("../models/Creator");
const DimpifiedTeamMember = require("../models/DimpTeamMember");
const sendOnboardingEmail = require("../utils/sendOnboardingEmail");
const mongoose = require("mongoose");

const origin = process.env.ORIGIN;

// Add a team member
exports.addTeamMember = async (body) => {
  const {
    fullName,
    gender,
    phoneNumber,
    email,
    ecosystemDomain,
    creatorId,
    services,
  } = body;

  const requiredFields = [
    "fullName",
    "gender",
    "phoneNumber",
    "email",
    "ecosystemDomain",
    "creatorId",
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }
  // Check if the creator exists
  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }

  // Check if the email already exists in Creator table
  const existingTeamMember = await Creator.findOne({ where: { email } });
  if (existingTeamMember) {
    return { status: 400, data: { message: "Email already in use" } };
  }

  // Hash default password (email)
  const hashedPassword = await bcrypt.hash(email, 10);

  // Create team member in Creator table
  const teamMember = await Creator.create({
    organizationName: creator.organizationName, // Fetch from the creator
    email,
    password: hashedPassword,
    role: "team_member",
  });

  console.log("creator:", teamMember);

  // Create team member in MongoDB (DimpifiedTeamMember)
  const dimpifiedTeamMember = new DimpifiedTeamMember({
    organizationName: creator.organizationName,
    email,
    phoneNumber,
    gender,
    fullName,
    ecosystemDomain,
    creatorId: teamMember.id,
    services,
    status: "active",
  });
  await dimpifiedTeamMember.save();
  console.log("teammeber:", dimpifiedTeamMember);

  // Send onboarding email
  await sendOnboardingEmail({
    email,
    fullName,
    origin, // Now origin is passed properly
    organizationName: creator.organizationName,
  });

  return { status: 201, data: { message: "Team member added successfully" } };
};

exports.onboardTeamMember = async (body) => {
  const {
    email,
    password,
    dateOfBirth,
    state,
    localGovernment,
    address,
    country,
  } = body;

  const requiredFields = [
    "email",
    "password",
    "dateOfBirth",
    "state",
    "localGovernment",
    "address",
    "country",
  ];
  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }
  // Check if the team member exists
  const teamMember = await DimpifiedTeamMember.findOne({ email });
  if (!teamMember) {
    return { status: 404, data: { message: "team member not found" } };
  }

  // Update password in the Creator table
  const hashedPassword = await bcrypt.hash(password, 10);
  await Creator.update({ password: hashedPassword }, { where: { email } });

  // Update additional details in DimpifiedTeamMember
  teamMember.dateOfBirth = dateOfBirth;
  teamMember.state = state;
  teamMember.localGovernment = localGovernment;
  teamMember.address = address;
  teamMember.country = country;
  await teamMember.save();

  return {
    status: 200,
    data: { message: "Onboarding completed successfully" },
  };
};

exports.getTeamMembers = async (params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return { status: 400, data: { message: "ecosystemDomain is required" } };
  }

  // Fetch all team members under the given ecosystem domain
  const teamMembers = await DimpifiedTeamMember.find({ ecosystemDomain, status:"active" });
  return { status: 200, data: { teamMembers } };
};

exports.deleteTeamMember = async (query) => {
  const { ids, ecosystemDomain } = query;

  if (!ids) {
    return { status: 400, data: { message: "ids are required" } };
  }

  // Convert the comma-separated string into an array
  const teamMemberIds = ids.split(",").map((id) => id.trim());

  // Validate ObjectIds
  const validIds = teamMemberIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (validIds.length === 0) {
    return { status: 400, data: { message: "Invalid team member IDs" } };
  }

  // Find and update the team members' status to "deactivated"
  const result = await DimpifiedTeamMember.updateMany(
    { _id: { $in: validIds } },
    { $set: { status: "deactivated" } }
  );

  if (result.modifiedCount === 0) {
    return { status: 404, data: { message: "No team members found to deactivate" } };
  }

  return {
    status: 200,
    data: { message: `${result.modifiedCount} Team member(s) deactivated successfully` },
  };
};

