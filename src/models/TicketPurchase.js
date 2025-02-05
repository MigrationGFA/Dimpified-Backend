const mongoose = require("mongoose");

const ticketPurchaseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
  ecosystemDomain: { type: String, required: true },
  date: { type: Date , required: true },
  status: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  shortDescription: { type: String },
});

const TicketPurchase = mongoose.model("TicketPurchase", ticketPurchaseSchema);
module.exports = TicketPurchase;
