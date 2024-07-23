const EcosystemUser = require("../../../models/EcosystemUser");
const PurchasedItem = require("../../../models/PurchasedItem");
const DigitalProduct = require("../../../models/DigitalProduct");
const Service = require("../../../models/Service");
const Course = require("../../../models/Course");


const getMyProductPage = async (req, res) => {
    const { userId, ecosystemDomain } = req.params;

    if (!userId || !ecosystemDomain) {
        return res.status(400).json({ message: "User ID and Ecosystem Domain are required" });
    }

    try {
        const myProducts = await PurchasedItem.findAll({
            where: {
                userId,
                ecosystemDomain
            },
        })

        // Retrieve detailed information for each item type
        const servicesPromises = myProducts
            .filter((item) => item.itemType === "Service")
            .map(async (item) => {
                const service = await Service.findById(item.itemId);
                return {
                    ...item.toJSON(),
                    service,
                };
            });

        const productsPromises = myProducts
            .filter((item) => item.itemType === "Product")
            .map(async (item) => {
                const product = await DigitalProduct.findById(item.itemId);
                return {
                    ...item.toJSON(),
                    product,
                };
            });

        const coursesPromises = myProducts
            .filter((item) => item.itemType === "Course")
            .map(async (item) => {
                const course = await Course.findById(item.itemId);
                return {
                    ...item.toJSON(),
                    course,
                };
            });


        const services = await Promise.all(servicesPromises);
        const products = await Promise.all(productsPromises);
        const courses = await Promise.all(coursesPromises);


        const detailedInfo = [...services, ...products, ...courses];

        res.status(200).json(detailedInfo);


    } catch (error) {
        console.error("Error fetching ecosystem user products:", error);
        res.status(500).json({ message: "Failed to fetch ecosystem user products" });
    }
};

const productPayOut = async (req, res) => {
    const { userId, ecosystemDomain } = req.params;

    if (!userId || !ecosystemDomain) {
        return res.status(400).json({ message: "User ID and Ecosystem Domain are required" });
    }

    try {
        const purchasedItems = await PurchasedItem.findAll({
            where: {
                userId,
                ecosystemDomain
            },
        });

        const productPayOutDetails = async (item) => {
            let itemDetails;
            switch (item.itemType) {
                case 'Product':
                    itemDetails = await DigitalProduct.findById(item.itemId);
                    break;
                case 'Service':
                    itemDetails = await Service.findById(item.itemId);
                    break;
                case 'Course':
                    itemDetails = await Course.findById(item.itemId);
                    break;
                default:
                    throw new Error(`Unknown item type: ${item.itemType}`);
            }

            if (!itemDetails) {
                throw new Error(`Item not found: ${item.itemId}`);
            }

            return {
                ...item.toJSON(),
                itemDetails: itemDetails.toJSON()
            };
        };

        const productPayOutItemsPromises = purchasedItems.map(async (item) => {
            try {
                return await productPayOutDetails(item);
            } catch (error) {
                console.error(`Error enriching item ${item.id}: ${error.message}`);
                return {
                    ...item.toJSON(),
                    itemDetails: null,
                    error: error.message
                };
            }
        });

        const payOutItems = await Promise.all(productPayOutItemsPromises);

        res.status(200).json(payOutItems);
    } catch (error) {
        console.error("Error fetching and payout items:", error);
        res.status(500).json({ message: "Failed to fetch and payout items" });
    }
}



module.exports = { getMyProductPage, productPayOut }