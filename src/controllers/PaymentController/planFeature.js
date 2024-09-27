const PlanFeature = require("../../models/PlanFeature");


const createPlan = async (req, res) => {
    try {
        const {
            planName,
            WebsiteBuilder,
            AddLogoToPage,
            CustomDomain,
            RemoveDIMPBrandFromLandingPage,
            MonthlyTransactions,
            TransactionFee,
            OnlinePaymentGateway,
            DIMPWallet,
            PaymentAnalytics,
            MultiCurrencyModule,
            FlexiblePricingModule,
            AppointmentBooking,
            CommunityAndChat,
            Fundraising,
            OnlineLearningManagementSolution,
            InvoicingAndBilling,
            AdminUserManagement,
            CustomerSupportTicketingModule,
            CustomerRecords,
            TechnicalSupport,
            ProfessionalEmail
        } = req.body;

        const requiredFields = [
            "planName",
            "WebsiteBuilder",
            "AddLogoToPage",
            "CustomDomain",
            "RemoveDIMPBrandFromLandingPage",
            "MonthlyTransactions",
            "TransactionFee",
            "OnlinePaymentGateway",
            "DIMPWallet",
            "PaymentAnalytics",
            "MultiCurrencyModule",
            "FlexiblePricingModule",
            "AppointmentBooking",
            "CommunityAndChat",
            "Fundraising",
            "OnlineLearningManagementSolution",
            "InvoicingAndBilling",
            "AdminUserManagement",
            "CustomerSupportTicketingModule",
            "CustomerRecords",
            "TechnicalSupport",
            "ProfessionalEmail",
        ];

        // Check for missing fields
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `${field} is required` });
            }
        }

        const newPlanFeature = new PlanFeature({
            planName,
            WebsiteBuilder,
            AddLogoToPage,
            CustomDomain,
            RemoveDIMPBrandFromLandingPage,
            MonthlyTransactions,
            TransactionFee,
            OnlinePaymentGateway,
            DIMPWallet,
            PaymentAnalytics,
            MultiCurrencyModule,
            FlexiblePricingModule,
            AppointmentBooking,
            CommunityAndChat,
            Fundraising,
            OnlineLearningManagementSolution,
            InvoicingAndBilling,
            AdminUserManagement,
            CustomerSupportTicketingModule,
            CustomerRecords,
            TechnicalSupport,
            ProfessionalEmail
        })
        await newPlanFeature.save()
        res.status(201).json({ message: 'Feature plan created successfully', planFeature: newPlanFeature });
    } catch (error) {
        console.error('Error creating feature plan:', error);
        res.status(500).json({ message: 'Failed to create feature plan', error });
    }
}

module.exports = createPlan