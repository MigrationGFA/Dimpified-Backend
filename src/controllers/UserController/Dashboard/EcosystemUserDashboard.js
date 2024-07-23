const EcosystemUser = require("../../../models/EcosystemUser");
const PurchasedItem = require("../../../models/PurchasedItem");
const { Op } = require('sequelize');
const Course = require("../../../models/Course");
const Service = require("../../../models/Service");



const getEcosystemUserDashboardData = async (req, res) => {
    try {
        const { userId, ecosystemDomain } = req.params;

        if (!userId || !ecosystemDomain) {
            return res.status(400).json({ message: "User ID and Ecosystem Domain are required" });
        }

        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const purchasedItems = await PurchasedItem.findAll({
            where: {
                userId,
                ecosystemDomain,
                purchaseDate: {
                    [Op.gte]: firstDayOfMonth,
                },
            },
        });

        if (purchasedItems.length === 0) {
            return res.json({ message: "No purchased items found for this user and domain in the current month." });
        }

        let totalNairaSpent = 0;
        let totalUSDSpent = 0;
        let totalEarning = 0;
        let totalCourses = 0;
        let newCourses = 0;
        let totalServices = 0;
        let newServices = 0;
        let totalProducts = 0;
        let newProducts = 0;


        purchasedItems.forEach(item => {
            if (item.currency === 'NGN') {
                totalNairaSpent += item.itemAmount;
            } else if (item.currency === 'USD') {
                totalUSDSpent += item.itemAmount;
            }


            switch (item.itemType) {
                case 'Course':
                    totalCourses++;
                    if (item.purchaseDate.getMonth() === currentDate.getMonth()) {
                        newCourses++;
                    }
                    break;
                case 'Service':
                    totalServices++;
                    if (item.purchaseDate.getMonth() === currentDate.getMonth()) {
                        newServices++;
                    }
                    break;
                case 'Product':
                    totalProducts++;
                    if (item.purchaseDate.getMonth() === currentDate.getMonth()) {
                        newProducts++;
                    }
                    break;
            }
        });

        res.json({
            totalNairaSpent,
            totalUSDSpent,
            totalCourses,
            newCourses,
            totalServices,
            newServices,
            totalProducts,
            newProducts,
        });
    } catch (error) {
        console.error('Error fetching get user dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const getTotalPurchasedProductsPerMonth = async (req, res) => {
    try {
        const { userId, ecosystemDomain } = req.params;

        if (!userId || !ecosystemDomain) {
            return res.status(404).json({ message: "User ID and Ecosystem Domain are required" });
        }

        const purchasedItems = await PurchasedItem.findAll({
            where: {
                userId,
                ecosystemDomain
            },
        });

        const purchasedItemsPerMonth = purchasedItems.reduce((acc, item) => {
            const purchaseDate = new Date(item.purchaseDate);
            const monthName = purchaseDate.toLocaleString("default", { month: "long" });
            acc[monthName] = (acc[monthName] || 0) + 1;
            return acc;
        }, {});

        const allMonths = Array.from({ length: 12 }, (_, index) => {
            const date = new Date(0, index);
            return date.toLocaleString("default", { month: "long" });
        });

        const allPurchasedItemsPerMonths = allMonths.map((month) => ({
            month,
            totalPurchasedItems: purchasedItemsPerMonth[month] || 0,
        }));

        res.json(allPurchasedItemsPerMonths);

    } catch (error) {
        console.error("Error fetching purchased items per month:", error);
        res.status(500).json({ error: "An error occurred while fetching the data." });
    }
}


module.exports = { getEcosystemUserDashboardData, getTotalPurchasedProductsPerMonth }