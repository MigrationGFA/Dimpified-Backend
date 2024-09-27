const mongoose = require("mongoose");

const PlanFeatureSchema = new mongoose.Schema({
    planName: {
        type: String,
        enum: ['Lite', 'Plus', 'Pro', 'Extra'],
        required: true
    },
    WebsiteBuilder: {
        type: String,
        required: true,
    },
    AddLogoToPage: {
        type: String,
        required: true,
    },
    CustomDomain: {
        type: String,
        required: true,
    },
    RemoveDIMPBrandFromLandingPage: {
        type: String,
        required: true,
    },
    MonthlyTransactions: {
        type: String,
        required: true,
    },
    TransactionFee: {
        type: String,
        required: true,
    },
    OnlinePaymentGateway: {
        type: String,
        required: true,
    },
    DIMPWallet: {
        type: String,
        required: true,
    },
    PaymentAnalytics: {
        type: String,
        required: true,
    },
    MultiCurrencyModule: {
        type: String,
        required: true,
    },
    FlexiblePricingModule: {
        type: String,
        required: true,
    },
    AppointmentBooking: {
        type: String,
        required: true,
    },
    CommunityAndChat: {
        type: String,
        required: true,
    },
    Fundraising: {
        type: String,
        required: true,
    },
    OnlineLearningManagementSolution: {
        type: String,
        required: true,
    },
    InvoicingAndBilling: {
        type: String,
        required: true,
    },
    AdminUserManagement: {
        type: String,
        required: true,
    },
    CustomerSupportTicketingModule: {
        type: String,
        required: true,
    },
    CustomerRecords: {
        type: String,
        required: true,
    },
    TechnicalSupport: {
        type: String,
        required: true,
    },
    ProfessionalEmail: {
        type: String,
        required: true,
    }

})
const PlanFeature = mongoose.model("DimpPlanFeature", PlanFeatureSchema)

module.exports = PlanFeature