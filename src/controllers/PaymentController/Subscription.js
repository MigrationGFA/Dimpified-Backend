const https = require("https");
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

const verifyPaystackSignature = (req) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");
  const paystackSignature = req.headers["x-paystack-signature"];

  return hash === paystackSignature;
};

const handleWebhook = async (req, res) => {
  try {
    if (!verifyPaystackSignature(req)) {
      return res.status(401).send("Unauthorized - Invalid Paystack signature");
    }

    const event = JSON.parse(req.body);

    switch (event.event) {
      case "subscription.create":
        console.log("New subscription created:", event.data);

        break;

      case "subscription.renew":
        console.log("Subscription renewed:", event.data);

        break;

      case "subscription.expiring":
        console.log("Subscription expiring soon:", event.data);
        break;

      case "subscription.disable":
        console.log("Subscription disabled:", event.data);
        break;

      default:
        console.log("Unhandled event type:", event.event);
    }

    res.status(200).send("Webhook received and processed successfully");
  } catch (error) {
    console.error("Error in handleWebhook function:", error);
    res.status(500).send("Server error");
  }
};

module.exports = { verifySubscription, handleWebhook };
