const Feedback = require("../../models/Feedback");

const giveFeedback = async (req, res) => {
  await Feedback.sync();
  try {
    const { ecosystemDomain, creatorId, name, email, reason, message } =
      req.body;

    if (
      !ecosystemDomain ||
      !creatorId ||
      !name ||
      !email ||
      !reason ||
      !message
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const feedback = await Feedback.create({
      ecosystemDomain,
      creatorId,
      name,
      email,
      reason,
      message,
    });

    return res.status(201).json(feedback);
  } catch (error) {
    console.error("Error saving feedback:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

const getFeeds = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    const feedbacks = await Feedback.findAll({
      where: { ecosystemDomain },
      order: [["id", "DESC"]],
    });

    if (feedbacks.length === 0) {
      return res
        .status(404)
        .json({ message: "No feedback found for this domain." });
    }

    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = { giveFeedback, getFeeds };
