const mongoose = require("mongoose");

const DimpIntegration = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    ecosystemId: {
      type: String,
      required: true,
    },
    ecosystemDomain: {
      type: String,
      required: true,
    },
    communication: communitySchema,
    pushNotifications: Boolean,
    gamificationEngine: Boolean,
    finance: priceSchema,
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DimpIntegration", DimpIntegration);

// Community integration
const communitySchema = new mongoose.Schema({
  enable: { type: Boolean, default: false },
  enableDiscussion: { type: Boolean, default: false },
  permission: {
    allowPost: Boolean,
    allowComment: Boolean,
    allowPoll: Boolean,
  },
  reaction: {
    upvotePost: Boolean,
    downvotePost: Boolean,
    allowPoll: Boolean,
  },
  attachement: {
    image: Boolean,
    article: Boolean,
  },
  courseDiscussion: {
    playerAndCommunity: Boolean,
    player: Boolean,
  },
});

const priceSchema = new mongoose.Schema({
  paymentGateway: {
    sandBox: Boolean,
    stripe: Boolean,
    paypal: Boolean,
    pagSegure: Boolean,
  },
  invoiceSetup: {
    prefix: String,
    VATnumber: Number,
    invoiceLogo: {
      doNotShowLogo: Boolean,
      showLogoOnInvoice: Boolean,
      uploadLogo: Boolean,
    },
    thankYouMessage: String,
    calculateVatInInvoices: String,
  },
  invoiceTexts: {
    invoiceNumber: String,
    invoice: String,
    date: String,
    clientDeatails: String,
    description: String,
    unitPrice: String,
    qty: String,
    total: String,
    discount: String,
    payableAmount: String,
    web: String,
    email: String,
    allPricesInclude: String,
    VAT: String,
  },
});
