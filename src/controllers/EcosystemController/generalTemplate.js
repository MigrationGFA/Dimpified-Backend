const ReservedTemplate = require("../../models/ReservedTemplate");

const createReservedTemplate = async (req, res) => {
  try {
    const newTemplate = new ReservedTemplate(req.body);

    const savedTemplate = await newTemplate.save();

    res.status(200).json({ message: "Templated created successfully" });
  } catch (error) {
    // Handle errors (e.g., validation errors, database errors)
    console.error("Error creating template:", error);
    res.status(500).json({ message: "error creating template" });
  }
};

module.exports = { createReservedTemplate };
