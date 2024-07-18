const https = require("https");
const Transaction = require("../../models/Transaction");
const PurchasedItem = require("../../models/PurchasedItem");
const Course = require("../../models/Course");
const Product = require("../../models/Product");
const Service = require("../../models/Service");
// const sendCoursePurchaseEmail = require("../../utils/sendCoursePurchase");
const CreatorEarning = require("../../models/CreatorEarning");
const Ecosystem = require("../../models/Ecosystem");
const { sequelize } = require("../../config/dbConnect");
const User = require("../../models/EcosystemUser");

// const verifyPayment = async (reference, provider) => {
//   let options;
//   if (provider === "paystack") {
//     options = {
//       hostname: "api.paystack.co",
//       port: 443,
//       path: `/transaction/verify/${reference}`,
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       },
//     };
//   } else if (provider === "flutterwave") {
//     options = {
//       hostname: "api.flutterwave.com",
//       port: 443,
//       path: `/v3/transactions/${reference}/verify`,
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
//       },
//     };
//   } else {
//     throw new Error("Unsupported payment provider");
//   }

//   try {
//     const apiRes = await new Promise((resolve, reject) => {
//       const apiReq = https.request(options, (res) => {
//         let data = "";

//         res.on("data", (chunk) => {
//           data += chunk;
//         });

//         res.on("end", () => {
//           resolve(data);
//         });
//       });

//       apiReq.on("error", (error) => {
//         reject(error);
//       });

//       apiReq.end();
//     });

//     return JSON.parse(apiRes);
//   } catch (error) {
//     throw error;
//   }
// };

// const VerifyPayment = async (req, res) => {
//   try {
//     await Transaction.sync();
//     await CreatorEarning.sync();
//     await PurchasedItem.sync();

//     const {
//       provider,
//       reference,
//       email,
//       itemId,
//       itemType,
//       userId,
//       ecosystemDomain,
//     } = req.body;
//     const details = [
//       "provider",
//       "reference",
//       "email",
//       "itemId",
//       "itemType",
//       "userId",
//       "ecosystemDomain",
//     ];

//     for (const detail of details) {
//       if (!req.body[detail]) {
//         return res.status(400).json({ message: `${detail} is required` });
//       }
//     }

//     const responseData = await verifyPayment(reference, provider);
//     if (!responseData || !responseData.data) {
//       return res.status(400).json({
//         message: "Payment verification failed, invalid response data",
//       });
//     }

//     let item;
//     let amount;
//     let itemTitle;
//     let itemPrice;
//     let creatorId = null;

//     if (itemType === "Course") {
//       const ecosystem = await Ecosystem.findOne({
//         ecosystemDomain: ecosystemDomain,
//       }).populate("courses");
//       if (!ecosystem) {
//         return res.status(404).json({ message: "Ecosystem not found" });
//       }

//       item = ecosystem.courses.find(
//         (course) => course._id.toString() === itemId
//       );
//       if (!item) {
//         return res
//           .status(400)
//           .json({ message: "Course does not exist in this ecosystem" });
//       }

//       amount = parseInt(item.price, 10);
//       itemTitle = item.title;
//       itemPrice = item.price;
//       creatorId = item.creatorId;
//       await Course.findByIdAndUpdate(itemId, {
//         $inc: { totalNumberOfEnrolledStudent: 1 },
//       });
//     } else if (itemType === "Product") {
//       item = await Product.findById(itemId);
//       if (!item) {
//         return res.status(404).json({ message: "Product not found" });
//       }

//       amount = parseInt(item.price, 10);
//       itemTitle = item.title;
//       itemPrice = item.price;
//       creatorId = item.creatorId;
//     } else if (itemType === "Service") {
//       item = await Service.findById(itemId);
//       if (!item) {
//         return res.status(404).json({ message: "Service not found" });
//       }

//       amount = parseInt(item.price, 10);
//       itemTitle = item.title;
//       itemPrice = item.price;
//       creatorId = item.creatorId;
//     } else {
//       return res.status(400).json({ message: "Unsupported item type" });
//     }

//     const currency = responseData.data.currency;

//     if (provider === "paystack") {
//       const convertAmount = responseData.data.amount / 100;
//       if (convertAmount !== amount) {
//         return res.status(400).json({ message: "Payment verification failed" });
//       }
//     } else if (provider === "flutterwave") {
//       if (
//         responseData.data.status !== "successful" ||
//         responseData.data.amount !== amount
//       ) {
//         return res.status(400).json({ message: "Payment verification failed" });
//       }
//     } else {
//       return res.status(400).json({ message: "Unsupported payment provider" });
//     }

//     const userTransaction = await Transaction.create({
//       email,
//       itemId,
//       itemType,
//       amount: responseData.data.amount,
//       paymentMethod:
//         responseData.data.channel || responseData.data.payment_type,
//       transactionDate: responseData.data.paid_at,
//       itemTitle,
//       userId,
//       creatorId,
//       status: responseData.data.status,
//       currency,
//     });

//     const purchasedItem = await PurchasedItem.create({
//       userId,
//       itemType,
//       itemId,
//       purchaseDate: new Date(),
//     });

//     if (itemType === "Course") {
//       await Ecosystem.updateOne(
//         { ecosystemDomain: ecosystemDomain },
//         { $inc: { users: 1 } }
//       );
//     }

//     if (creatorId) {
//       let creatorEarning = await CreatorEarning.findOne({
//         where: { userId: creatorId },
//       });

//       if (!creatorEarning) {
//         creatorEarning = await CreatorEarning.create({
//           userId: creatorId,
//           Naira: 0,
//           Dollar: 0,
//         });
//       }

//       switch (currency) {
//         case "NGN":
//           creatorEarning.Naira += amount;
//           break;
//         case "USD":
//           creatorEarning.Dollar += amount;
//           break;
//         default:
//           return res.status(400).json({ message: "Unsupported currency" });
//       }

//       await creatorEarning.save();
//     }

//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(400).json({ message: "User does not exist" });
//     }

//     // await sendCoursePurchaseEmail({
//     //   username: user.username,
//     //   email: email,
//     //   title: itemTitle,
//     //   price: itemPrice,
//     //   category: item.category,
//     //   hour: item.hour,
//     // });

//     return res.status(201).json({
//       message: "Item Purchased Successfully",
//       responseData,
//       userTransaction,
//       purchasedItem,
//       currency,
//     });
//   } catch (error) {
//     console.error(error);
//     res
//       .status(500)
//       .json({ message: "An error occurred during payment verification" });
//   }
// };

const verifyPayment = async (reference, provider) => {
  let options;
  if (provider === "paystack") {
    options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };
  } else if (provider === "flutterwave") {
    options = {
      hostname: "api.flutterwave.com",
      port: 443,
      path: `/v3/transactions/${reference}/verify`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    };
  } else {
    throw new Error("Unsupported payment provider");
  }

  try {
    const apiRes = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      });

      apiReq.on("error", (error) => {
        reject(error);
      });

      apiReq.end();
    });

    return JSON.parse(apiRes);
  } catch (error) {
    throw error;
  }
};

const VerifyPayment = async (req, res) => {
  try {
    await Transaction.sync();
    await CreatorEarning.sync();
    await PurchasedItem.sync();

    const {
      provider,
      reference,
      email,
      itemId,
      itemType,
      userId,
      ecosystemDomain,
    } = req.body;
    const details = [
      "provider",
      "reference",
      "email",
      "itemId",
      "itemType",
      "userId",
      "ecosystemDomain",
    ];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    let item;
    let amount;
    let itemTitle;
    let itemPrice;
    let creatorId = null;

    if (itemType === "Course") {
      const ecosystem = await Ecosystem.findOne({
        ecosystemDomain: ecosystemDomain,
      }).populate("courses");
      if (!ecosystem) {
        return res.status(404).json({ message: "Ecosystem not found" });
      }

      item = ecosystem.courses.find(
        (course) => course._id.toString() === itemId
      );
      if (!item) {
        return res
          .status(400)
          .json({ message: "Course does not exist in this ecosystem" });
      }

      amount = parseInt(item.price, 10);
      itemTitle = item.title;
      itemPrice = item.price;
      creatorId = item.creatorId;
    } else if (itemType === "Product") {
      item = await Product.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Product not found" });
      }

      amount = parseInt(item.price, 10);
      itemTitle = item.title;
      itemPrice = item.price;
      creatorId = item.creatorId;
    } else if (itemType === "Service") {
      item = await Service.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Service not found" });
      }

      amount = parseInt(item.price, 10);
      itemTitle = item.title;
      itemPrice = item.price;
      creatorId = item.creatorId;
    } else {
      return res.status(400).json({ message: "Unsupported item type" });
    }

    const userTransaction = await Transaction.create({
      email,
      itemId,
      itemType,
      amount,
      paymentMethod: provider,
      transactionDate: new Date(),
      itemTitle,
      userId,
      creatorId,
      status: "pending",
      currency: "NGN",
    });

    const responseData = await verifyPayment(reference, provider);
    if (!responseData || !responseData.data) {
      return res.status(400).json({
        message: "Payment verification failed, invalid response data",
      });
    }

    const currency = responseData.data.currency;
    let verifiedAmount;

    if (provider === "paystack") {
      verifiedAmount = responseData.data.amount / 100;
      if (verifiedAmount !== amount) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } else if (provider === "flutterwave") {
      verifiedAmount = responseData.data.amount;
      if (
        responseData.data.status !== "successful" ||
        verifiedAmount !== amount
      ) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported payment provider" });
    }

    await userTransaction.update({
      status: responseData.data.status,
      currency,
    });

    const purchasedItem = await PurchasedItem.create({
      userId,
      itemType,
      itemId,
      itemAmount: verifiedAmount,
      currency,
      purchaseDate: new Date(),
      ecosystemDomain,
    });

    if (itemType === "Course") {
      await Course.findByIdAndUpdate(itemId, {
        $inc: { totalNumberOfEnrolledStudent: 1 },
      });
      await Ecosystem.updateOne(
        { ecosystemDomain: ecosystemDomain },
        { $inc: { users: 1 } }
      );
    }

    if (creatorId) {
      let creatorEarning = await CreatorEarning.findOne({
        where: { userId: creatorId },
      });

      if (!creatorEarning) {
        creatorEarning = await CreatorEarning.create({
          userId: creatorId,
          Naira: 0,
          Dollar: 0,
        });
      }

      switch (currency) {
        case "NGN":
          creatorEarning.Naira += verifiedAmount;
          break;
        case "USD":
          creatorEarning.Dollar += verifiedAmount;
          break;
        default:
          return res.status(400).json({ message: "Unsupported currency" });
      }

      await creatorEarning.save();
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // await sendCoursePurchaseEmail({
    //   username: user.username,
    //   email: email,
    //   title: itemTitle,
    //   price: itemPrice,
    //   category: item.category,
    //   hour: item.hour,
    // });

    return res.status(201).json({
      message: "Item Purchased Successfully",
      responseData,
      userTransaction,
      purchasedItem,
      currency,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred during payment verification" });
  }
};

module.exports = VerifyPayment;

module.exports = VerifyPayment;
