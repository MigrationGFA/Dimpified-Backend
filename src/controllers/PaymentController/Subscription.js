const https = require("https");
const Subscription = require("../../models/Subscription");
const Creator = require("../../models/Creator");

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

    const { reference, creatorId } = req.body;
    const details = ["reference", "creatorId"];

    for (const detail of details) {
      if (!req.body[detail]) {
        console.log(`${detail} is required`);
        return res.status(400).json({ message: `${detail} is required` });
      }
    }

    const responseData = await verifyPayment(reference);
    if (!responseData || !responseData.data) {
      return res.status(400).json({
        message: "Payment verification failed, invalid response data",
      });
    }

    const amount = responseData.data.amount / 100;
    const currency = responseData.data.currency;
    const status = responseData.data.status;
    const email = responseData.data.customer.email;
    const plan = responseData.data.plan_object.plan_code;
    const sizeLimitString = responseData.data.plan_object.name;
    const interval = responseData.data.plan_object.interval;
    const metadata = responseData.data.metadata;

    if (status !== "success") {
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

    const validPlanCodes = {
      monthly: 1,
      "Bi-annual": 6,
      annual: 12,
    };

    const months = validPlanCodes[interval];
    if (!months) {
      return res.status(400).json({ message: "Invalid plan interval" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await Subscription.create({
      creatorId,
      planCode: plan,
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

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.status(400).json({ message: "Creator does not exist" });
    }
    return res.status(201).json({
      message: "Subscription verified successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error in verifySubscription function:", error);
    res
      .status(500)
      .json({ message: "An error occurred during subscription verification" });
  }
};
module.exports = verifySubscription;
