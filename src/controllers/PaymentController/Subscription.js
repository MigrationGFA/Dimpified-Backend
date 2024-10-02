const https = require("https");
const crypto = require("crypto");
const Subscription = require("../../models/Subscription");
const Creator = require("../../models/Creator");
const Affiliate = require("../../models/Affiliate");
const AffiliateEarning = require("../../models/AffiliateEarning");
const AffiliateEarningHistory = require("../../models/AffiliateEarningHistory");
const SubscriptionTransaction = require("../../models/subscriptionTransaction");

// Function to verify payment using Paystack
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
    await Subscription.sync();
    await AffiliateEarning.sync();
    await AffiliateEarningHistory.sync();
    await SubscriptionTransaction.sync();

    const { reference, creatorId, planType } = req.body;

    const responseData = await verifyPayment(reference);

    if (!responseData || !responseData.data) {
      return res.status(400).json({
        message: "Payment verification failed, invalid response data",
      });
    }

    // Extract necessary data from the payment response
    const amount = responseData.data.amount / 100; // Convert from kobo/cents to actual currency value
    const currency = responseData.data.currency;
    const status = responseData.data.status;
    const email = responseData.data.customer.email;
    const plan = responseData.data.plan_object.plan_code;
    const sizeLimitString = responseData.data.plan_object.name;
    const interval = responseData.data.plan_object.interval;
    const metadata = responseData.data.metadata;

    if (status !== "success") {
      await SubscriptionTransaction.create({
        creatorId,
        reference,
        planCode: plan,
        planType,
        amount,
        currency,
        email,
        startDate: null,
        endDate: null,
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

    // Map interval to months
    const validPlanCodes = {
      monthly: 1,
      "Bi-annual": 6,
      annual: 12,
    };

    const months = validPlanCodes[interval];
    if (!months) {
      return res.status(400).json({ message: "Invalid plan interval" });
    }

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    let transaction = await SubscriptionTransaction.create({
      creatorId,
      reference,
      planCode: plan,
      planType,
      amount,
      currency,
      email,
      startDate,
      endDate,
      interval,
      sizeLimit: sizeLimitString,
      status: "successful",
    });

    let subscription = await Subscription.findOne({ where: { creatorId } });
    if (subscription) {
      subscription = await subscription.update({
        planCode: plan,
        planType,
        startDate,
        endDate,
        sizeLimit: sizeLimitString,
        amount,
        currency,
        email,
        username,
        interval,
        status,
        subscriptionCount: subscription.subscriptionCount + 1,
      });
    } else {
      subscription = await Subscription.create({
        creatorId,
        planCode: plan,
        planType,
        startDate,
        endDate,
        sizeLimit: sizeLimitString,
        amount,
        currency,
        email,
        username,
        interval,
        status,
      });
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Creator does not exist" });
    }

    let getAffiliateEarning;
    let createAffiliateHistory;

    if (creator.affiliateId !== null) {
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
          currency: currency,
          planType: planType,
          sizeLimit: sizeLimitString,
          interval: interval,
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
    res
      .status(500)
      .json({ message: "An error occurred during subscription verification" });
  }
};

const handleWebhooks = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  // Verify signature
  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).json({ message: "Invalid signature" });
  }

  const event = req.body.event;
  const { data } = req.body;

  try {
    if (event === "subscription.charge.success") {
      const { customer, plan_object, amount, currency, status, reference } =
        data;
      const planCode = plan_object.plan_code;
      const email = customer.email;
      const sizeLimitString = plan_object.name;
      const interval = plan_object.interval;

      // Find or create subscription record
      let subscription = await Subscription.findOne({
        where: { email, planCode },
      });

      const startDate = new Date();
      const endDate = new Date();
      const validPlanCodes = { monthly: 1, "Bi-annual": 6, annual: 12 };
      const months = validPlanCodes[interval] || 0;
      endDate.setMonth(endDate.getMonth() + months);

      if (subscription) {
        // Update existing subscription
        await subscription.update({
          startDate,
          endDate,
          amount: amount / 100,
          currency,
          sizeLimit: sizeLimitString,
          interval,
          status: "active",
          subscriptionCount: subscription.subscriptionCount + 1,
        });

        console.log("Subscription updated successfully");
      } else {
        // Create new subscription
        subscription = await Subscription.create({
          creatorId: null,
          username: customer.first_name,
          planCode,
          planType: plan_object.name,
          amount: amount / 100,
          currency,
          status: "active",
          email,
          startDate,
          endDate,
          interval,
          sizeLimit: sizeLimitString,
          subscriptionCount: 1,
        });

        console.log("New subscription created successfully");
      }

      await SubscriptionTransaction.create({
        creatorId: subscription.creatorId || null,
        reference,
        planCode,
        planType: plan_object.name,
        amount: amount / 100,
        currency,
        status,
        email,
        startDate,
        endDate,
        interval,
        sizeLimit: sizeLimitString,
        subscriptionCount: subscription.subscriptionCount,
      });

      return res
        .status(200)
        .json({ message: "Subscription charge success processed" });
    }

    if (event === "subscription.disable") {
      const { customer, plan_object } = data;
      const email = customer.email;
      const planCode = plan_object.plan_code;

      const subscription = await Subscription.findOne({
        where: { email, planCode },
      });

      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }

      await subscription.update({
        status: "canceled",
      });

      await SubscriptionTransaction.create({
        creatorId: subscription.creatorId || null,
        reference: null,
        planCode,
        planType: plan_object.name,
        amount: 0,
        currency: subscription.currency,
        status: "canceled",
        email,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        interval: subscription.interval,
        sizeLimit: subscription.sizeLimit,
        subscriptionCount: subscription.subscriptionCount,
      });

      console.log(
        `Subscription canceled for creator ${subscription.creatorId}`
      );

      return res
        .status(200)
        .json({ message: "Subscription canceled successfully" });
    }

    return res.status(200).json({ message: "Event type not handled" });
  } catch (error) {
    console.error("Error in handleWebhooks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { verifySubscription, handleWebhooks };
