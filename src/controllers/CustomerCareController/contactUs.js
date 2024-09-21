const ContactUs = require("../../models/ContactUs");
const sendContactUsFeedbackEmail = require("../../utils/sendContactUsFeedbackEmail");
//const sendHelpRequestFeedback = require("../../utils/sendHelpRequestFeedback");
const sendSupportRequestCompletedEmail = require("../../utils/supportRequestCompleted");

const BarberContact = require("../../models/BarberContact")



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

const sendContactUsFeedback = async (req, res) => {
  try {
    const { id, subject, message } = req.body;

    if (!id || !subject || !message) {
      return res.status(400).send({ error: 'id, subject, and message are required' });
    }

    const contactUs = await ContactUs.findByPk(id)


    const { firstName, email, reason } = contactUs;


    await sendContactUsFeedbackEmail({
      firstName,
      email,
      subject,
      reason,
      message,
    });

    res.status(200).send({ message: 'Your Contact us feedback email was sent successfully' });
  } catch (error) {
    console.error('Error sending feedback email:', error);
    res.status(500).send({ error: 'An error occurred while sending the feedback email' })
  }
}

const createBarberContact = async (req, res) => {
  await BarberContact.sync()
  try {
    const {
      name,
      phone,
      businessName,
      email,
      state,
      lga,
      businessAddress,
      businessCity,
      landmark,
      consent,
      latitude,
      longitude,
      city,
    } = req.body;

    // Ensure required fields are provided
    const requiredFields = [
      "name",
      "phone",
      "businessName",
      "email",
      "state",
      "lga",
      "businessAddress",
      "businessCity",
      "landmark",
      "consent",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const existingContact = await BarberContact.findOne({ where: { email } });
    if (existingContact) {
      return res.status(409).json({ message: "You have previously register your email" });
    }

    const newBarberContact = await BarberContact.create({
      name,
      phone,
      businessName,
      email,
      state,
      lga,
      businessAddress,
      businessCity,
      landmark,
      consent,
      latitude,
      longitude,
      city,
    });

    return res
      .status(201)
      .json({ message: "Barber contact created successfully", newBarberContact });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const getBarberContactUs = async (req, res) => {
  try {
    const getBarber = await BarberContact.findAll({
      // order: [["createdAt", "DESC"]],
    })
    const filteredBarbers = getBarber.slice(10); 

    const totalRegister = filteredBarbers.length;

    const stateNormalized = filteredBarbers.map((barber) => barber.state.toLowerCase());

   // Create an object to store the count of each unique state
    const stateCount = stateNormalized.reduce((acc, state) => {
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({ totalRegister, stateCount, allBarber:filteredBarbers, });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
}
module.exports = {
  userContactUs,
  allContactUs,
  contactUsCompleted,
  sendContactUsFeedback,
  createBarberContact,
  getBarberContactUs
};
