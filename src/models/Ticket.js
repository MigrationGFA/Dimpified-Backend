const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  adminType: {
    type: String,
    required: true,
  },
  benefits: [
    {
      type: String,
    },
  ],

  shortDescription: {
    type: String,
  },
  currency: {
    type: String,
  },

  ecosystemDomain: {
    type: String,
    required: true,
  },
  creatorId: {
    type: Number,
    required: true,
  },
});

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
