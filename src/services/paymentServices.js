const mongoose = require("mongoose");
const https = require("https");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const Subscription = require("../models/Subscription");
const AffiliateEarning = require("../models/AffiliateEarning");
const AffiliateEarningHistory = require("../models/AffiliateEarningHistory");
const Creator = require("../models/Creator");
const SubscriptionTransaction = require("../models/subscriptionTransaction");
const Booking = require("../models/DimpBooking");
const User = require("../models/EcosystemUser");
const PurchasedItem = require("../models/PurchasedItem");
const EcosystemUser = require("../models/EcosystemUser");
const GFACommision = require("../models/GFACommision");
const ecosystemTransaction = require("../models/ecosystemTransaction");
const creatorEarning = require("../models/CreatorEarning");
const {
  verifyPayment,
  calculatePercentageDifference,
  generateMonthRange,
} = require("../helper/Payment");
const createSubdomain = require("../helper/Subdomain");
const CreatorEarning = require("../models/CreatorEarning");

const { Op, fn, col, literal } = require("sequelize");
const withdrawalRequest = require("../models/withdrawalRequest");
const Account = require("../models/Account");
const Ecosystem = require("../models/Ecosystem");
const CreatorTemplate = require("../models/creatorTemplate");
const Notification = require("../models/ecosystemNotification");
const sendBookingConfirmationUnpaidEmail = require("../utils/sendBookingConfirmationUnpaid");
const sendBookingConfirmationPaidEmail = require("../utils/sendBoookingConfirmationEmailPaid");

exports.verifySubscription = async (body) => {
  const {
    reference,
    creatorId,
    planType,
    sizeLimit,
    interval,
    ecosystemDomain,
  } = body;

  const requiredFields = [
    "reference",
    "creatorId",
    "planType",
    "sizeLimit",
    "interval",
    "ecosystemDomain",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  // Verify payment
  const responseData = await verifyPayment(reference);
  if (!responseData || !responseData.data) {
    return {
      status: 400,
      data: {
        message: "Payment verification failed, invalid response data",
      },
    };
  }

  // Extract data from payment response
  const amount = responseData.data.amount / 100;
  const currency = responseData.data.currency;
  const paymentStatus = responseData.data.status;
  const email = responseData.data.customer.email;
  const sizeLimitString = sizeLimit;
  console.log(sizeLimitString);
  const metadata = responseData.data.metadata;
  const planCode = "one time payment";

  // Calculate subscription duration based on interval from request
  const validPlanCodes = { monthly: 1, "Bi-annually": 6, annually: 12 };
  const months = validPlanCodes[interval.toLowerCase()] || 1;
  console.log("this is month", months);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    console.error(`Ecosystem not found for domain: ${ecosystemDomain}`);
    return {
      status: 404,
      data: { message: "Ecosystem not found" },
    };
  }

  // Create a failed transaction record if payment verification fails
  if (paymentStatus !== "success") {
    await SubscriptionTransaction.create({
      creatorId,
      planCode,
      reference,
      planType,
      amount,
      currency,
      sizeLimit: sizeLimitString,
      status: "failed",
      ecosystemDomain,
    });
    return { status: 400, data: { message: "Payment verification failed" } };
  }

  console.log("this is metadata", metadata);
  if (
    !metadata ||
    !metadata.custom_fields ||
    !Array.isArray(metadata.custom_fields)
  ) {
    return {
      status: 404,
      data: { message: "Metadata or custom fields are missing" },
    };
  }

  const usernameField = metadata.custom_fields.find(
    (field) => field.display_name
  );
  if (!usernameField || !usernameField.value) {
    return {
      status: 404,
      data: { message: "Required custom fields are missing or invalid" },
    };
  }

  const username = usernameField.value;

  const transactionData = {
    creatorId,
    reference,
    planCode,
    planType,
    amount,
    currency,
    sizeLimit: sizeLimitString,
    status: "successful",
    ecosystemDomain,
  };
  console.log("this is here 1");
  const transaction = await SubscriptionTransaction.create(transactionData);
  console.log("this is here 2");

  // Handle subscription updates or creation
  let subscription = await Subscription.findOne({ where: { creatorId } });
  if (subscription) {
    subscription = await subscription.update({
      planType,
      planCode,
      startDate,
      endDate,
      sizeLimit: sizeLimitString,
      amount,
      currency,
      email,
      username,
      interval,
      status: "successful",
      subscriptionCount: subscription.subscriptionCount + 1,
      ecosystemDomain,
    });
  } else {
    subscription = await Subscription.create({
      creatorId,
      planCode,
      planType,
      startDate,
      endDate,
      sizeLimit: sizeLimitString,
      amount,
      currency,
      email,
      username,
      interval,
      status: "successful",
      ecosystemDomain,
    });
  }

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator does not exist" } };
  }

  let getAffiliateEarning;
  let createAffiliateHistory;

  if (creator.affiliateId !== null && paymentStatus === "success") {
    getAffiliateEarning = await AffiliateEarning.findOne({
      where: { affiliateId: creator.affiliateId },
    });

    if (!getAffiliateEarning) {
      getAffiliateEarning = await AffiliateEarning.create({
        affiliateId: creator.affiliateId,
        Naira: 0,
        Dollar: 0,
      });
    }

    let affiliateShare;
    if (subscription.subscriptionCount < 2) {
      affiliateShare = (15 / 100) * amount;

      switch (currency) {
        case "NGN":
          getAffiliateEarning.Naira = (
            parseFloat(getAffiliateEarning.Naira) + parseFloat(affiliateShare)
          ).toFixed(2);
          break;
        case "USD":
          getAffiliateEarning.Dollar = (
            parseFloat(getAffiliateEarning.Dollar) + parseFloat(affiliateShare)
          ).toFixed(2);
          break;
        default:
          return { status: 404, data: { message: "Unsupported currency" } };
      }

      await getAffiliateEarning.save();

      createAffiliateHistory = await AffiliateEarningHistory.create({
        affiliateId: creator.affiliateId,
        userId: creatorId,
        amount: parseFloat(affiliateShare).toFixed(2),
        currency,
        planType,
        sizeLimit: sizeLimitString,
        interval,
      });
    }
  }

  console.log("this is eco creation");
  const result = await createSubdomain(ecosystemDomain);
  creator.step = 5;
  await creator.save();

  return {
    status: 201,
    data: {
      message: "Subscription verified successfully",
      ecosystemDomain,
      planType
    },
  };
};

exports.updateSubscription = async (body) => {
  const {
    reference,
    creatorId,
    planType,
    sizeLimit,
    interval,
    ecosystemDomain,
  } = body;

  const requiredFields = [
    "reference",
    "creatorId",
    "planType",
    "sizeLimit",
    "interval",
    "ecosystemDomain",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  // Verify payment
  const responseData = await verifyPayment(reference);
  if (!responseData || !responseData.data) {
    return {
      status: 400,
      data: {
        message: "Payment verification failed, invalid response data",
      },
    };
  }

  // Extract data from payment response
  const amount = responseData.data.amount / 100;
  const currency = responseData.data.currency;
  const paymentStatus = responseData.data.status;
  const email = responseData.data.customer.email;
  const sizeLimitString = sizeLimit;
  console.log(sizeLimitString);
  const metadata = responseData.data.metadata;
  const planCode = "one time payment";

  // Calculate subscription duration based on interval from request
  const validPlanCodes = { monthly: 1, "Bi-annually": 6, annually: 12 };
  const months = validPlanCodes[interval.toLowerCase()] || 1;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    console.error(`Ecosystem not found for domain: ${ecosystemDomain}`);
    return {
      status: 404,
      data: { message: "Ecosystem not found" },
    };
  }

  // Create a failed transaction record if payment verification fails
  if (paymentStatus !== "success") {
    await SubscriptionTransaction.create({
      creatorId,
      planCode,
      reference,
      planType,
      amount,
      currency,
      sizeLimit: sizeLimitString,
      status: "failed",
      ecosystemDomain,
    });
    return { status: 400, data: { message: "Payment verification failed" } };
  }

  if (
    !metadata ||
    !metadata.custom_fields ||
    !Array.isArray(metadata.custom_fields)
  ) {
    return {
      status: 404,
      data: { message: "Metadata or custom fields are missing" },
    };
  }

  const usernameField = metadata.custom_fields.find(
    (field) => field.display_name
  );
  if (!usernameField || !usernameField.value) {
    return {
      status: 404,
      data: { message: "Required custom fields are missing or invalid" },
    };
  }

  const username = usernameField.value;

  const transactionData = {
    creatorId,
    reference,
    planCode,
    planType,
    amount,
    currency,
    sizeLimit: sizeLimitString,
    status: "successful",
    ecosystemDomain,
  };
  console.log("this is here 1");
  const transaction = await SubscriptionTransaction.create(transactionData);
  console.log("this is here 2");

  // Handle subscription updates or creation
  let subscription = await Subscription.findOne({ where: { creatorId } });
  if (subscription) {
    subscription = await subscription.update({
      planType,
      planCode,
      startDate,
      endDate,
      sizeLimit: sizeLimitString,
      amount,
      currency,
      email,
      username,
      interval,
      status: "successful",
      subscriptionCount: subscription.subscriptionCount + 1,
      ecosystemDomain,
    });
  } else {
    subscription = await Subscription.create({
      creatorId,
      planCode,
      planType,
      startDate,
      endDate,
      sizeLimit: sizeLimitString,
      amount,
      currency,
      email,
      username,
      interval,
      status: "successful",
      ecosystemDomain,
    });
  }

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator does not exist" } };
  }

  let getAffiliateEarning;
  let createAffiliateHistory;

  if (creator.affiliateId !== null && paymentStatus === "success") {
    getAffiliateEarning = await AffiliateEarning.findOne({
      where: { affiliateId: creator.affiliateId },
    });

    if (!getAffiliateEarning) {
      getAffiliateEarning = await AffiliateEarning.create({
        affiliateId: creator.affiliateId,
        Naira: 0,
        Dollar: 0,
      });
    }

    let affiliateShare;
    if (subscription.subscriptionCount < 2) {
      affiliateShare = (15 / 100) * amount;

      switch (currency) {
        case "NGN":
          getAffiliateEarning.Naira = (
            parseFloat(getAffiliateEarning.Naira) + parseFloat(affiliateShare)
          ).toFixed(2);
          break;
        case "USD":
          getAffiliateEarning.Dollar = (
            parseFloat(getAffiliateEarning.Dollar) + parseFloat(affiliateShare)
          ).toFixed(2);
          break;
        default:
          return { status: 404, data: { message: "Unsupported currency" } };
      }

      await getAffiliateEarning.save();

      createAffiliateHistory = await AffiliateEarningHistory.create({
        affiliateId: creator.affiliateId,
        userId: creatorId,
        amount: parseFloat(affiliateShare).toFixed(2),
        currency,
        planType,
        sizeLimit: sizeLimitString,
        interval,
      });
    }
  }

  return {
    status: 201,
    data: {
      message: "Subscription updated successfully",
      ecosystemDomain,
      planType,
    },
  };
};

exports.createLiteSubscribtion = async (body) => {
  const { creatorId, planType, sizeLimit, interval, ecosystemDomain } = body;

  const requiredFields = [
    "ecosystemDomain",
    "creatorId",
    "planType",
    "sizeLimit",
    "interval",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  const planCode = "free";

  // Calculate subscription duration based on interval from request
  const validPlanCodes = { monthly: 1, "Bi-annually": 6, annually: 12 };

  const months = validPlanCodes[interval.toLowerCase()] || 1;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);

  const creator = await Creator.findByPk(creatorId);
  if (!creator) {
    return res.status(400).json({ message: "Creator does not exist" });
  }

  // Handle subscription updates or creation
  // Handle subscription updates or creation
  const subscription = await Subscription.create({
    creatorId,
    planCode,
    planType,
    startDate,
    endDate,
    sizeLimit: sizeLimit,
    amount: 0.0,
    currency: "NGN",
    email: creator.email,
    username: creator.organizationName,
    interval,
    ecosystemDomain,
    status: "successful",
  });

  const result = await createSubdomain(ecosystemDomain);

  creator.step = 5;
  await creator.save();

  return {
    status: 201,
    data: {
      message: "Subscription verified successfully",
      ecosystemDomain,
      planType,
    },
  };
};

exports.ecosystemEarning = async (params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return { status: 400, data: { message: "ecosystemDomain is required" } };
  }

  const creatorEarnings = await CreatorEarning.findOne({
    where: { ecosystemDomain },
  });

  if (!creatorEarnings || creatorEarnings.length === 0) {
    return {
      status: 400,
      data: { message: "No earnings found for the given ecosystem" },
    };
  }

  const totalEarnings = creatorEarnings;

  const plan = await Subscription.findOne({
    where: {
      creatorId: creatorEarnings.creatorId,
    },
  });
  let availableBalance = 0;
  if (totalEarnings.Naira !== 0) {
    console.log("this is earning before tax", totalEarnings.Naira);
    if (!plan) {
      const getBalance = (totalEarnings.Naira * 7.5) / 100;
      availableBalance = totalEarnings.Naira - getBalance;
    } else if (plan.planType === "Lite") {
      const getBalance = (totalEarnings.Naira * 7.5) / 100;
      availableBalance = totalEarnings.Naira - getBalance;
    } else if (plan.planType === "Plus") {
      const getBalance = (totalEarnings.Naira * 4) / 100;
      availableBalance = totalEarnings.Naira - getBalance;
    } else if (plan.planType === "Pro") {
      const getBalance = (totalEarnings.Naira * 3) / 100;
      availableBalance = totalEarnings.Naira - getBalance;
    } else if (plan.planType === "Extra") {
      const getBalance = (totalEarnings.Naira * 2) / 100;
      availableBalance = totalEarnings.Naira - getBalance;
    }
  }

  return {
    status: 200,
    data: {
      message: `Total earnings for ${ecosystemDomain} ecosystem`,
      totalEarnings,
      availableBalance,
    },
  };
};

exports.incomeStats = async (params) => {
  const { ecosystemDomain } = params;
  const currentDate = new Date();

  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const totalWeeks = Math.ceil(
    (endOfMonth.getDate() - startOfMonth.getDate() + 1) / 7
  );

  const weeklyIncome = {};
  for (let i = 1; i <= totalWeeks; i++) {
    weeklyIncome[`Week ${i}`] = 0.0;
  }

  const incomePerWeek = await ecosystemTransaction.findAll({
    where: {
      ecosystemDomain: ecosystemDomain,
      itemTitle: "Booking",
      status: "Paid",
      transactionDate: {
        [Op.between]: [startOfMonth, endOfMonth],
      },
    },
    attributes: [
      [
        literal(`FLOOR((DAYOFMONTH(transactionDate) - 1) / 7) + 1`),
        "weekNumber",
      ],
      [fn("SUM", col("amount")), "totalIncome"],
    ],
    group: ["weekNumber"],
    order: [[literal("weekNumber"), "ASC"]],
  });

  let totalMonthlyIncome = 0;
  incomePerWeek.forEach((item) => {
    const weekNumber = item.get("weekNumber");
    const income = parseFloat(item.get("totalIncome"));
    weeklyIncome[`Week ${weekNumber}`] = income;
    totalMonthlyIncome += income;
  });

  return {
    status: 200,
    data: {
      month: currentDate.toLocaleString("default", { month: "long" }),
      weeklyIncome,
      totalMonthlyIncome,
    },
  };
};

exports.withdrawalRequest = async (params) => {
  const { ecosystemDomain } = params;

  const whereClause = ecosystemDomain ? { ecosystemDomain } : {};

  const withdrawalRequests = await withdrawalRequest.findAll({
    where: whereClause,
    include: {
      model: Account,
      attributes: ["accountNumber", "accountName", "bankName"],
    },
    order: [["createdAt", "DESC"]],
  });

  if (!withdrawalRequests.length) {
    return {
      status: 200,
      data: { message: "There are no withdrawal requests" },
    };
  } else {
    return {
      status: 200,
      data: { withdrawalRequests },
    };
  }
};

exports.dailySuccessful = async (params) => {
  const { ecosystemDomain } = params;
  const currentDate = new Date();

  const startOfDay = new Date(
    Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      0,
      0,
      0
    )
  );

  const endOfDay = new Date(
    Date.UTC(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      23,
      59,
      59
    )
  );

  const totalAmount = await ecosystemTransaction.sum("amount", {
    where: {
      ecosystemDomain: ecosystemDomain,
      status: "success",
      transactionDate: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  return {
    status: 200,
    data: {
      message: "Total successful transaction for today",
      totalAmount: totalAmount || 0,
    },
  };
};

exports.totalMonthlySales = async (params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return { status: 400, data: { message: "ecosystemDomain is required" } };
  }

  const currentMonth = moment().startOf("month");
  const fiveMonthsAgo = moment().subtract(5, "months").startOf("month");

  const salesData = await Booking.aggregate([
    {
      $match: {
        date: {
          $gte: fiveMonthsAgo.toDate(),
          $lte: currentMonth.endOf("month").toDate(),
        },
        paymentStatus: "Paid",
        ecosystemDomain: ecosystemDomain,
      },
    },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        totalSales: { $sum: "$price" },
      },
    },
    {
      $sort: { "_id.year": -1, "_id.month": -1 },
    },
  ]);

  const allMonthsInRange = generateMonthRange(fiveMonthsAgo, currentMonth);

  salesData.forEach((data) => {
    const monthName = moment()
      .month(data._id.month - 1)
      .year(data._id.year)
      .format("MMMM YYYY");

    const matchingMonth = allMonthsInRange.find((m) => m.month === monthName);
    if (matchingMonth) {
      matchingMonth.totalSales = data.totalSales;
    }
  });

  const currentMonthSales = allMonthsInRange[5]?.totalSales || 0;
  const lastMonthSales = allMonthsInRange[4]?.totalSales || 0;

  const percentageDifference = calculatePercentageDifference(
    currentMonthSales,
    lastMonthSales
  );

  const response = {
    currentMonthSales,
    lastMonthSales,
    percentageDifference,
    salesWithMonthNames: allMonthsInRange,
  };

  return {
    status: 200,
    data: {
      message: "Total Monthly Sales",
      response,
    },
  };
};

exports.transactionHistory = async (params) => {
  const { ecosystemDomain } = params;

  if (!ecosystemDomain) {
    return { status: 400, data: { message: "ecosystemDomain is required" } };
  }
  const transactions = await ecosystemTransaction.findAll({
    where: { ecosystemDomain },
    attributes: { exclude: ["itemTitle", "createdAt", "updatedAt"] },
    order: [["transactionDate", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["username"], // Include only the username from User model
      },
    ],
  });

  if (!transactions.length) {
    return {
      status: 400,
      data: "No transactions found for ecosystemDomain",
    };
  } else {
    return {
      status: 200,
      data: {
        message: "Ecosystem transaction history fetched successfully",
        data: transactions,
      },
    };
  }
};

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

exports.createBookingRecord = async (body) => {
  console.log("createBookingRecord function called");

  // Destructure request body
  const {
    provider,
    reference,
    ecosystemDomain,
    email,
    providerCharge,
    companyCharge,
    name,
    phone,
    address,
    description,
    location,
    service,
    date,
    time,
    bookingType,
    price,
  } = body;

  const requiredFields = [
    "ecosystemDomain",
    "name",
    "email",
    "phone",
    "location",
    "bookingType",
    "service",
    "date",
    "time",
    "price",
    "provider",
    "reference",
  ];

  // Validate required fields
  for (const field of requiredFields) {
    if (!body[field]) {
      return { status: 400, data: { message: `${field} is required` } };
    }
  }

  let user;

  // Find or create EcosystemUser based on email and ecosystemDomain
  user = await EcosystemUser.findOne({ where: { email, ecosystemDomain } });
  if (!user) {
    const hashedPassword = await bcrypt.hash(email, 10); // Hash email as temporary password
    user = await EcosystemUser.create({
      email,
      ecosystemDomain,
      username: name,
      password: hashedPassword,
    });
  }

  // Find ecosystem and ensure it exists
  const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
  if (!ecosystem) {
    console.error(`Ecosystem not found for domain: ${ecosystemDomain}`);
    return {
      status: 404,
      data: { message: "Ecosystem not found" },
    };
  }

  // Check for an existing booking at the same date and time
  const existingBooking = await Booking.findOne({
    where: { date, time, ecosystemDomain },
  });
  if (existingBooking) {
    return {
      status: 400,
      data: { message: "The selected date and time are already booked." },
    };
  }

  // Generate unique booking ID
  const generateUniqueId = () => {
    const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
    const numbers = Math.floor(100 + Math.random() * 900);
    return `${letters}${numbers}`;
  };
  const bookingId = generateUniqueId();

  // Create new booking record
  const newBooking = await Booking.create({
    bookingId,
    name,
    email,
    phone,
    location,
    description,
    address,
    service,
    date,
    time,
    price,
    bookingType,
    ecosystemDomain,
    paymentStatus: "Pending",
  });

  // Verify payment
  const responseData = await thirdPartyVerification(reference, provider);
  if (!responseData || !responseData.data) {
    console.error("Invalid payment verification response");
    return {
      status: 400,
      data: { message: "Invalid payment verification response" },
    };
  }

  // Check payment status and amounts
  const paymentAmount = responseData.data.amount;
  const currency = responseData.data.currency;
  let verifiedAmount = paymentAmount - companyCharge - providerCharge;

  if (responseData.data.status !== "successful" || verifiedAmount !== price) {
    await ecosystemTransaction.create({
      email,
      ecosystemDomain,
      itemId: newBooking.id,
      itemType: "Service",
      amount: verifiedAmount,
      paymentMethod: provider,
      transactionDate: new Date(),
      itemTitle: "Booking",
      status: "failed",
      currency,
      userId: user.id,
    });
    return { status: 400, data: { message: "Payment verification failed" } };
  } else {
    await ecosystemTransaction.create({
      email,
      ecosystemDomain,
      itemId: newBooking.id,
      itemType: "Service",
      amount: verifiedAmount,
      paymentMethod: provider,
      transactionDate: new Date(),
      itemTitle: "Booking",
      status: "success",
      currency,
      userId: user.id,
    });
  }

  // Payment successful, update booking and transaction
  newBooking.paymentStatus = "Paid";
  await newBooking.save();

  const creator = await Creator.findByPk(ecosystem.creatorId);
  if (!creator) {
    return { status: 404, data: { message: "Creator not found" } };
  }
  creator.transactionNumber += 1;
  await creator.save();

  // Update creator earnings and GFA commission
  let creatorEarningRecord = await CreatorEarning.findOne({
    where: { creatorId: ecosystem.creatorId },
  });
  if (!creatorEarningRecord) {
    creatorEarningRecord = await CreatorEarning.create({
      creatorId: ecosystem.creatorId,
      Naira: 0,
      Dollar: 0,
      ecosystemDomain,
    });
  }

  let gfaCommission = await GFACommision.findOne();
  if (!gfaCommission) {
    gfaCommission = await GFACommision.create({ Naira: 0, Dollar: 0 });
  }

  // Update earnings based on the currency
  if (currency === "NGN") {
    creatorEarningRecord.Naira = (
      parseFloat(creatorEarningRecord.Naira) + verifiedAmount
    ).toFixed(2);
    gfaCommission.Naira = (
      parseFloat(gfaCommission.Naira) + companyCharge
    ).toFixed(2);
  } else if (currency === "USD") {
    creatorEarningRecord.Dollar = (
      parseFloat(creatorEarningRecord.Dollar) + verifiedAmount
    ).toFixed(2);
    gfaCommission.Dollar = (
      parseFloat(gfaCommission.Dollar) + companyCharge
    ).toFixed(2);
  } else {
    return { status: 400, data: { message: "Unsupported currency" } };
  }

  await gfaCommission.save();
  await creatorEarningRecord.save();

  // Get creator's business logo and address from the template
  const creatorTemplate = await CreatorTemplate.findOne({ ecosystemDomain });
  const logo = creatorTemplate.navbar.logo;
  const businessAddress = ecosystem.address;
  const businessName = creator.organizationName;

  // Create a notification after successful payment
  const notificationMessage = `🎉 Payment received! ${name} has successfully booked the ${service} service. The appointment is confirmed for ${date}. Booking ID: ${bookingId}.`;

  const newNotification = new Notification({
    type: "Booking Payment",
    message: notificationMessage,
    ecosystemDomain,
    creatorId: ecosystem.creatorId,
  });

  await newNotification.save();

  // Send email notifications
  await sendBookingConfirmationPaidEmail({
    email: creator.email,
    name: creator.organizationName,
    bookingId,
    service,
    bookingType,
    date,
    time,
    paymentStatus: newBooking.paymentStatus,
    businessName,
    businessAddress,
    logo,
  });

  await sendBookingConfirmationUnpaidEmail({
    email,
    name,
    bookingId,
    service,
    bookingType,
    date,
    time,
    paymentStatus: newBooking.paymentStatus,
    businessName,
    businessAddress,
    logo,
  });

  return {
    status: 200,
    data: {
      message: "Booking created and payment verified successfully",
      booking: newBooking,
      notification: newNotification,
    },
  };
};
