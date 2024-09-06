const https = require("https");
const Transaction = require("../../models/Transaction");
const PurchasedItem = require("../../models/PurchasedItem");
const Course = require("../../models/Course");
const Product = require("../../models/Product");
const Service = require("../../models/Service");
const CreatorEarning = require("../../models/CreatorEarning");
const Ecosystem = require("../../models/Ecosystem");
const { sequelize } = require("../../config/dbConnect");
const User = require("../../models/EcosystemUser");
const Booking = require("../../models/DimpBooking");
const sendBookingPaymentConfirmationEmail = require("../../utils/bookingpaymentNotification");
const GFACommision = require("../../models/GFACommision")

const VAT_RATE = 0.075;
const thirdPartyVerification = async (reference, provider) => {
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
  console.log("VerifyPayment function called");
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
      if (isNaN(amount)) {
        return res.status(400).json({ message: "Invalid price for course" });
      }
      itemTitle = item.title;
      itemPrice = item.price;
      creatorId = item.creatorId;
    } else if (itemType === "Product") {
      item = await Product.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Product not found" });
      }

      itemPrice = parseFloat(item.price);
      if (isNaN(itemPrice)) {
        return res.status(400).json({ message: "Invalid price for product" });
      }
      amount = itemPrice + itemPrice * VAT_RATE;
      itemTitle = item.title;
      creatorId = item.creatorId;
    } else if (itemType === "Service") {
      item = await Service.findById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Service not found" });
      }

      const packageItem = item.services[0];
      if (!packageItem) {
        return res.status(404).json({ message: "No package found in service" });
      }

      itemPrice = parseFloat(packageItem.price);
      if (isNaN(itemPrice)) {
        return res
          .status(400)
          .json({ message: "Invalid price for service package" });
      }
      // for vat
      amount = itemPrice + itemPrice * VAT_RATE; // Adding VAT to the price
      itemTitle = item.header;
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
      status:  responseData.data.status,
      currency: responseData.data.currency,
    });

    const responseData = await thirdPartyVerification(reference, provider);
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
        where: { creatorId: creatorId },
      });

      if (!creatorEarning) {
        creatorEarning = await CreatorEarning.create({
          creatorId,
          ecosystemDomain,
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
          console.log("Unsupported currency");
          return res.status(400).json({ message: "Unsupported currency" });
      }

      await creatorEarning.save();
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    let successMessage;
    if (itemType === "Course") {
      successMessage = "Course purchased successfully";
    } else if (itemType === "Product") {
      successMessage = "Product purchased successfully";
    } else if (itemType === "Service") {
      successMessage = "Service payment confirmed";
    } else {
      successMessage = "Item purchased successfully";
    }
    return res.status(201).json({
      message: successMessage,
      responseData,
      userTransaction,
      purchasedItem,
      currency,
    });
  } catch (error) {
    console.error("Error in VerifyPayment function:", error);
    res
      .status(500)
      .json({ message: "An error occurred during payment verification" });
  }
};

const verifyBookingPayment = async (req, res) => {
  console.log("verifyBookingPayment function called");
 
  try {
      await Transaction.sync();
    await CreatorEarning.sync();
    await PurchasedItem.sync();
    const { provider, reference, bookingId, ecosystemDomain,  email, providerCharge, companyCharge } = req.body;
    console.log("this is first")
    const details = [
      "provider",
      "reference",
      "bookingId",
      "ecosystemDomain",
      "email",
      "providerCharge",
      "companyCharge"
    ];
    console.log("this is second")
    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    console.log("this is third")
    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({
        message: "Ecosystem not found",
      });
    }
    console.log("this is fourth")
    const amount = booking.price; // Assuming the booking has a totalAmount field
    const responseData = await thirdPartyVerification(reference, provider);
    console.log("this is response", responseData.data.amount)

    console.log("this is fifth")
    if (!responseData || !responseData.data) {
      return res.status(400).json({
        message: "Payment verification failed, invalid response data",
      });
    }
     console.log("this is 6")

    let verifiedAmount;
    const getAmount = responseData.data.amount ;
    console.log("this is 7")
    if (provider === "paystack") {
      verifiedAmount = getAmount - companyCharge - providerCharge;
      if (verifiedAmount !== amount) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } else if (provider === "flutterwave") {
      verifiedAmount = getAmount - companyCharge - providerCharge;
      console.log("this is 8")
      console.log("this is verify",verifiedAmount)
      console.log("this is amount",amount)

      if (
        responseData.data.status !== "successful" ||
        verifiedAmount !== amount
      ) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported payment provider" });
    }

    console.log("this is 9")


    // Update the booking payment status to "paid"
    booking.paymentStatus = "Paid";
    await booking.save(); // Save the changes to the booking document

    const currency = responseData.data.currency;

    console.log("this is here")

    let creatorEarning = await CreatorEarning.findOne({
      where: { ecosystemDomain },
    });
    console.log("this is here two")
     if (!creatorEarning) {
      creatorEarning = await CreatorEarning.create({
        creatorId: ecosystem.creatorId,
        ecosystemDomain,
        Naira: 0,
        Dollar: 0,
      });
    }


        const userTransaction = await Transaction.create({
      email: booking.email,
      itemId: booking.bookingId,
      itemType: "Service",
      amount: verifiedAmount,
      paymentMethod: provider,
      transactionDate: new Date(),
      itemTitle: "Booking",
      userId: 1,
      creatorId: creatorEarning.creatorId,
      status: responseData.data.status,
      currency: currency,
    });
    console.log("this is transaction", userTransaction)

      const purchasedItem = await PurchasedItem.create({
      userId: 1,
      itemType: "Service",
      itemId: booking.bookingId,
      itemAmount: verifiedAmount,
      currency: currency,
      purchaseDate: new Date(),
      ecosystemDomain,
    });

   

   let gfaCommission = await GFACommision.findOne();
    if (!gfaCommission) {
      gfaCommission = await GFACommision.create({
        Naira: 0,
        Dollar: 0,
      });
    }

    switch (currency) {
      case "NGN":
        creatorEarning.Naira += verifiedAmount;
        gfaCommission.Naira +=  parseFloat(companyCharge);
        break;
      case "USD":
        creatorEarning.Dollar += verifiedAmount;
        gfaCommission.Dollar =  parseFloat(companyCharge);
        break;
      default:
        console.log("Unsupported currency");
        return res.status(400).json({ message: "Unsupported currency" });
    }

    await gfaCommission.save()
    await creatorEarning.save();
console.log(creatorEarning)
    await sendBookingPaymentConfirmationEmail({
      email: booking.email,
      bookingId: booking.bookingId,
      paymentAmount: verifiedAmount,
      paymentDate: new Date().toISOString(),
      paymentMethod: provider,
    });

    return res.status(201).json({
      message: "Booking payment verified and updated to paid",
      booking,
    });
  } catch (error) {
    console.error("Error in verifyBookingPayment function:", error);
    res.status(500).json({
      
      message: "An error occurred during booking payment verification", error
    });
  }
};



module.exports = { VerifyPayment, verifyBookingPayment };
