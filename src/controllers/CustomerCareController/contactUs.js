const ContactUs = require("../../models/ContactUs");
const sendSupportRequestCompletedEmail = require("../../utils/supportRequestCompleted");

const userContactUs = async (req, res) => {
  await ContactUs.sync();
  try {
    const { firstName, lastName, contact, reason, message, email } = req.body;

    const details = [
      "firstName",
      "lastName",
      "contact",
      "reason",
      "message",
      "email",
    ];
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const createContact = await ContactUs.create({
      firstName,
      lastName,
      contact,
      reason,
      message,
      email,
    });
    return res.status(201).json({
      message: "Thanks for Contacting Us",
      data: createContact,
    });
  } catch (error) {
    console.log("profile ", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error });
  }
};

const allContactUs = async (req, res) => {
  try {
    const contactUs = await ContactUs.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ contactUs });
  } catch (error) {
    console.log("Error fetching contact submissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const contactUsCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const contactUsSubmission = await ContactUs.findByPk(id);

    if (!contactUsSubmission) {
      return res.status(404).json({ message: "Contact submission not found" });
    }

    await contactUsSubmission.update({ status: "completed" });
    await sendSupportRequestCompletedEmail({
      username: contactUsSubmission.firstName,
      email: contactUsSubmission.email,
      supportId: id,
      supportReason: contactUsSubmission.reason,
    });

    res
      .status(200)
      .json({ message: "Contact Us form submission marked as completed" });
  } catch (error) {
    console.error("Error marking contact submission as completed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  userContactUs,
  allContactUs,
  contactUsCompleted,
};
