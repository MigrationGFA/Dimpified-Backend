const bcrypt = require("bcryptjs");
const Creator = require("../models/Creator");
const DimpifiedTeamMember = require("../models/DimpTeamMember");
const sendOnboardingEmail = require("../utils/sendOnboardingEmail");

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

  console.log("creator:",teamMember)

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
console.log("teammeber:",dimpifiedTeamMember)

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

exports.getTeamMembers = async ( params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return { status: 400, data: { message: "ecosystemDomain is required" } };
  }

  // Fetch all team members under the given ecosystem domain
  const teamMembers = await DimpifiedTeamMember.find({ ecosystemDomain });
  return { status: 200, data: { teamMembers } };
};

exports.deleteTeamMember = async ( params) => {
  const { teamMemberId } = params;

  // Find and update the team member's status to "deactivated"
  const teamMember = await DimpifiedTeamMember.findByIdAndUpdate(
    teamMemberId,
    { status: "deactivated" },
    { new: true }
  );

  if (!teamMember) {
    return { status: 404, data: { message: "Team member not found" } };
  }
  return {
    status: 200,
    data: { message: "Team member deactivated successfully" },
  };
};
