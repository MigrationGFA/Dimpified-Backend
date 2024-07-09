const https = require("https");
const Transaction = require("../../models/Transaction");
const UserSubscribtion = require("../../models/UserSubscribtion");
const Course = require("../../models/Course");
const sendCoursePurchaseEmail = require("../../utils/sendCoursePurchase");
const CreatorEarning = require("../../models/InstructorPaymentRecords");
const Ecosystem = require("../../models/Ecosystem");
const { sequelize } = require("../../config/dbConnect");
const PaymentRequest = require("../../models/InstructorPaymentRequest");
const User = require("../../models/Users");
const sendInstructorWithdrawalEmail = require("../../utils/sendInstructorWithdrawalRequest");
const Account = require("../../models/Account");

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

const VerifyCoursePayment = async (req, res) => {
  try {
    await UserSubscribtion.sync();
    await Transaction.sync();
    await CreatorEarning.sync();

    const { provider, reference, email, courseId, userId, ecosystemId } =
      req.body;
    const details = [
      "provider",
      "reference",
      "email",
      "courseId",
      "userId",
      "ecosystemId",
    ];

    for (const detail of details) {
      if (!req.body[detail]) {
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const responseData = await verifyPayment(reference, provider);
    console.log(responseData);

    if (!responseData || !responseData.data) {
      return res.status(400).json({
        message: "Payment verification failed, invalid response data",
      });
    }

    const ecosystem = await Ecosystem.findById(ecosystemId).populate("courses");
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const getCourse = ecosystem.courses.find(
      (course) => course._id.toString() === courseId
    );
    if (!getCourse) {
      return res
        .status(400)
        .json({ message: `Course does not exist in this ecosystem` });
    }

    const amount = parseInt(getCourse.price, 10);
    const currency = responseData.data.currency;

    console.log("Provider:", provider);
    console.log("Response Status:", responseData.data.status);
    console.log("Response Amount:", responseData.data.amount);
    console.log("Course Amount:", amount);

    if (provider === "paystack") {
      const convertAmount = responseData.data.amount / 100;
      if (convertAmount !== amount) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } else if (provider === "flutterwave") {
      if (
        responseData.data.status !== "successful" ||
        responseData.data.amount !== amount
      ) {
        return res.status(400).json({ message: "Payment verification failed" });
      }
    } else {
      return res.status(400).json({ message: "Unsupported payment provider" });
    }

    const userTransaction = await Transaction.create({
      email,
      courseId,
      amount: responseData.data.amount,
      paymentMethod:
        responseData.data.channel || responseData.data.payment_type,
      transactionDate: responseData.data.paid_at,
      course_title: getCourse.title,
      userId,
      creatorId: getCourse.Agent.creatorId,
      status: responseData.data.status,
      currency,
    });

    const subscription = await UserSubscription.create({
      userId,
      courseId,
      startDate: new Date(),
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { totalNumberOfEnrolledStudent: 1 },
    });

    await Ecosystem.findByIdAndUpdate(ecosystemId, {
      $inc: { users: 1 },
    });

    const creatorId = getCourse.Agent.creatorId;
    let creatorEarning = await CreatorEarning.findOne({
      where: { userId: creatorId },
    });

    if (!creatorEarning) {
      creatorEarning = await CreatorEarning.create({
        userId: creatorId,
        Naira: 0,
        Dollar: 0,
        Euros: 0,
        Pounds: 0,
      });
    }

    switch (currency) {
      case "NGN":
        creatorEarning.Naira += amount;
        break;
      case "USD":
        creatorEarning.Dollar += amount;
        break;
      case "EUR":
        creatorEarning.Euros += amount;
        break;
      case "GBP":
        creatorEarning.Pounds += amount;
        break;
      default:
        return res.status(400).json({ message: `Unsupported currency` });
    }

    await creatorEarning.save();

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: `User does not exist` });
    }

    await sendCoursePurchaseEmail({
      username: user.username,
      email: email,
      title: getCourse.title,
      price: getCourse.price,
      category: getCourse.category,
      hour: getCourse.hour,
    });

    return res.status(201).json({
      message: "Course Purchased Successfully",
      responseData,
      userTransaction,
      subscription,
      currency,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred during payment verification" });
  }
};

module.exports = VerifyCoursePayment;
