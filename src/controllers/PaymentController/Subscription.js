const https = require("https");
const crypto = require("crypto");
const Subscription = require("../../models/Subscription");
const AffiliateEarning = require("../../models/AffiliateEarning");
const AffiliateEarningHistory = require("../../models/AffiliateEarningHistory");
const Creator = require("../../models/Creator");
const SubscriptionTransaction = require("../../models/subscriptionTransaction");


const verifyPayment = async (reference) => {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

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

const verifySubscription = async (req, res) => {
  try {
    // Sync models
    await Subscription.sync();
    await AffiliateEarning.sync();
    await AffiliateEarningHistory.sync();
    await SubscriptionTransaction.sync();

    const { reference, creatorId, planType, sizeLimit, plan, interval } =
      req.body;

    // Verify payment
    const responseData = await verifyPayment(reference);
    if (!responseData || !responseData.data) {
      return res.status(400).json({
        message: "Payment verification failed, invalid response data",
      });
    }

    console.log(responseData);

    // Extract data from payment response
    const amount = responseData.data.amount / 100;
    const currency = responseData.data.currency;
    const paymentStatus = responseData.data.status;
    const email = responseData.data.customer.email;
    const sizeLimitString = sizeLimit || responseData.data.plan_object?.name;
    console.log(sizeLimitString);
    const metadata = responseData.data.metadata;
    const planCode =
      plan || responseData.data.plan_object?.code || "default_plan";

    // Calculate subscription duration based on interval from request
    const validPlanCodes = { monthly: 1, "Bi-annually": 6, annually: 12 };
    const months = validPlanCodes[interval.toLowerCase()] || 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    if (paymentStatus !== "success") {
      await SubscriptionTransaction.create({
        creatorId,
        planCode,
        reference,
        planType,
        amount,
        currency,
        email,
        startDate: startDate,
        endDate: endDate,
        interval,
        sizeLimit: sizeLimitString,
        status: "failed",
      });
      return res.status(400).json({ message: "Payment verification failed" });
    }

    if (
      !metadata ||
      !metadata.custom_fields ||
      !Array.isArray(metadata.custom_fields)
    ) {
      return res
        .status(400)
        .json({ message: "Metadata or custom fields are missing" });
    }

    const usernameField = metadata.custom_fields.find(
      (field) => field.display_name
    );
    if (!usernameField || !usernameField.value) {
      return res
        .status(400)
        .json({ message: "Required custom fields are missing or invalid" });
    }

    const username = usernameField.value;

    const transactionData = {
      creatorId,
      reference,
      planCode,
      planType,
      amount,
      currency,
      email,
      startDate: startDate,
      endDate: endDate,
      interval,
      sizeLimit: sizeLimitString,
      status: "successful",
    };

    const transaction = await SubscriptionTransaction.create(transactionData);

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
      });
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Creator does not exist" });
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
              parseFloat(getAffiliateEarning.Dollar) +
              parseFloat(affiliateShare)
            ).toFixed(2);
            break;
          default:
            return res.status(400).json({ message: "Unsupported currency" });
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

    return res.status(201).json({
      message: "Subscription verified successfully",
      subscription,
      getAffiliateEarning,
      createAffiliateHistory,
      transaction,
    });
  } catch (error) {
    console.error("Error in verifySubscription function:", error);
    res.status(500).json({
      message: "An error occurred during subscription verification",
    });
  }
};

const handleWebhooksForRecurringCharges = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  const generatedSignature = generatePaystackSignature(secret, req.body);

  const incomingSignature = req.headers["x-paystack-signature"];

  if (generatedSignature !== incomingSignature) {
    console.error("Invalid Paystack webhook signature");
    return res
      .status(400)
      .json({ message: "Invalid Paystack webhook signature" });
  }

  const event = req.body;

  if (
    event.event === "subscription.charge.success" ||
    event.event === "subscription.charge.failed"
  ) {
    const reference = event.data.reference;
    const status = event.data.status;
    const creatorId = event.data.metadata.creatorId;
    const planCode = event.data.plan_object.plan_code;
    const email = event.data.customer.email;
    const interval = event.data.plan_object.interval;
    const amount = event.data.amount / 100;
    const isSuccessful = status === "success";

    try {
      const paymentVerification = await verifyPayment(reference);

      let subscription = await Subscription.findOne({ where: { creatorId } });

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      const startDate = new Date();
      const endDate = new Date();
      const intervalMonths = getIntervalMonths(interval);
      endDate.setMonth(endDate.getMonth() + intervalMonths);

      await SubscriptionTransaction.create({
        creatorId,
        reference,
        planCode,
        amount,
        startDate,
        planType: event.data.plan_object.name,
        endDate,
        currency: event.data.currency || "NGN",
        email,
        interval,
        status: isSuccessful ? "successful" : "failed",
        sizeLimit: event.data.plan_object.name,
      });

      if (isSuccessful) {
        subscription = await subscription.update({
          startDate,
          endDate,
          status: "active",
          subscriptionCount: subscription.subscriptionCount + 1,
        });

        return res.status(200).json({
          message: "Subscription updated successfully",
          subscription,
        });
      } else {
        return res.status(400).json({
          message: "Recurring charge failed",
        });
      }
    } catch (error) {
      console.error("Error updating subscription for recurring charge:", error);
      return res.status(500).json({
        message: "An error occurred while updating subscription",
      });
    }
  }

  res.sendStatus(200);
};

const generatePaystackSignature = (secret, payload) => {
  const jsonPayload = JSON.stringify(payload);

  const hash = crypto
    .createHmac("sha512", secret)
    .update(jsonPayload)
    .digest("hex");

  return hash;
};

const getIntervalMonths = (interval) => {
  const intervals = {
    monthly: 1,
    "Bi-annual": 6,
    annual: 12,
  };

  return intervals[interval] || 0;
};

module.exports = {
  verifySubscription,
  handleWebhooksForRecurringCharges,
};
