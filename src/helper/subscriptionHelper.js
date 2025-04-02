const { Op } = require("sequelize");
const Subscription = require("../models/Subscription");
const sendSubscriptionReminder = require("../utils/subscriptionReminder")
const newsSendSMS = require("./newSms")
const CreatorProfile = require("../models/CreatorProfile")
const sendLiteDeactionReminder = require("../utils/LiteDeactivationReminder")

const formatDateToStartOfDay = (date) => {
    return new Date(date.setHours(0, 0, 0, 0)); // Normalize to start of day
};

const formatDateToEndOfDay = (date) => {
    return new Date(date.setHours(23, 59, 59, 999)); // Normalize to end of day
};

const sendSubscriptionReminders = async () => {
    try {
        const today = new Date();

        // Calculate future dates for reminders
        const sevenDaysAheadStart = formatDateToStartOfDay(new Date(today.setDate(today.getDate() + 7)));
        const sevenDaysAheadEnd = formatDateToEndOfDay(new Date(sevenDaysAheadStart));

      const threeDaysAheadStart = formatDateToStartOfDay(new Date(today.setDate(today.getDate() - 4))); 
        const threeDaysAheadEnd = formatDateToEndOfDay(new Date(threeDaysAheadStart));

        const oneDayAheadStart = formatDateToStartOfDay(new Date(today.setDate(today.getDate() - 2))); 
          const oneDayAheadEnd = formatDateToEndOfDay(new Date(oneDayAheadStart));
          
        // Find users whose subscriptions expire in 7 days, 3 days, and 1 day
        const subscriptions = await Subscription.findAll({
            where: {
                endDate: {
                    [Op.or]: [
                            { [Op.between]: [sevenDaysAheadStart, sevenDaysAheadEnd] },
                          { [Op.between]: [threeDaysAheadStart, threeDaysAheadEnd] },
                        { [Op.between]: [oneDayAheadStart, oneDayAheadEnd] },
                    ],
                },
                 amount: {
            [Op.gt]: 0, // Only notify users with a non-zero amount
        },
            },
        });

        if (subscriptions.length === 0) {
            console.log("✅ No subscriptions requiring reminders today.");
            return;
        }

        // Send reminders
        for (const sub of subscriptions) {
            let daysLeft;
            if (sub.endDate.toDateString() === sevenDaysAheadStart.toDateString()) daysLeft = "7 days";
            if (sub.endDate.toDateString() === threeDaysAheadStart.toDateString()) daysLeft = "3 days";
            if (sub.endDate.toDateString() === oneDayAheadStart.toDateString()) daysLeft = "24 hours";
            
            const creatorProfile = await CreatorProfile.findOne({ creatorId: sub.creatorId })
              if (!creatorProfile) {
                    console.log("creator does not exist")
                    return
              }
            const message = `
                Hello ${sub.username}, Your subscription plan (${sub.planType}) Plan will expire in ${daysLeft}. Please renew your subscription to continue using our services.

                Visit: https://dimpified.com/auth/login?subscription
            `;

              await sendSubscriptionReminder({
                    day: daysLeft,
                  email: sub.email,
      organizationName: sub.username,
      websiteUrl: `https://${sub.ecosystemDomain}.dimpified.com`,
      plan: sub.planType,
      amount: sub.amount,
                    formattedDate: sub.endDate
      
            });
            await newsSendSMS(creatorProfile.phoneNumber, message, "plain"); // Assuming phoneNumber exists

            console.log(`📩 Reminder sent to ${sub.email} (expires in ${daysLeft} days)`);
          }
          return 
    } catch (error) {
        console.error("❌ Error sending subscription reminders:", error);
    }
}


const sendLitePlanDownGradeReminder = async () => {
  try {
    const today = new Date();

    // Calculate future dates for reminders
    const sevenDaysAhead = new Date();
    sevenDaysAhead.setDate(today.getDate() + 7);

    const threeDaysAhead = new Date();
    threeDaysAhead.setDate(today.getDate() + 3);

    const oneDayAhead = new Date();
    oneDayAhead.setDate(today.getDate() + 1);

    // Fetch Lite Plan subscriptions expiring soon
    const subscriptions = await Subscription.findAll({
      where: {
        planType: "Lite",
        endDate: {
          [Op.or]: [
            { [Op.between]: [formatDateToStartOfDay(sevenDaysAhead), formatDateToEndOfDay(sevenDaysAhead)] },
            { [Op.between]: [formatDateToStartOfDay(threeDaysAhead), formatDateToEndOfDay(threeDaysAhead)] },
            { [Op.between]: [formatDateToStartOfDay(oneDayAhead), formatDateToEndOfDay(oneDayAhead)] },
          ],
        },
      },
    });

    if (subscriptions.length === 0) {
      console.log("✅ No Lite plan subscriptions requiring reminders today.");
      return;
    }

    // Send reminders
    for (const sub of subscriptions) {
      let daysLeft = "";
      const endDateStr = sub.endDate.toISOString().split("T")[0];

      if (endDateStr === sevenDaysAhead.toISOString().split("T")[0]) daysLeft = "in 7 days";
      if (endDateStr === threeDaysAhead.toISOString().split("T")[0]) daysLeft = "in 3 days";
      if (endDateStr === oneDayAhead.toISOString().split("T")[0]) daysLeft = "in 24 hours";

      if (!daysLeft) continue; // Skip if no match found

      const creatorProfile = await CreatorProfile.findOne({ creatorId: sub.creatorId });
      if (!creatorProfile) {
        console.log(`❌ Creator profile not found for ID: ${sub.creatorId}`);
        continue;
      }

      const message = `
        Hello ${creatorProfile.fullName}, Your Lite Plan subscription will expire in ${daysLeft}. Your Business website on https://${sub.ecosystemDomain}.dimpified.com will be disabled if you do not upgrade to a paid plan.

        Upgrade now: https://dimpified.com/auth/login?subscription
      `;

      // Send email reminder
      await sendLiteDeactionReminder({
        day: daysLeft,
        email: creatorProfile.email,
        organizationName: creatorProfile.fullName,
        websiteUrl: `https://${sub.ecosystemDomain}.dimpified.com`,
        plan: sub.planType,
        formattedDate: sub.endDate,
      });

      // Send SMS reminder
      await newsSendSMS(creatorProfile.phoneNumber, message, "plain");

      console.log(`📩 Reminder sent to ${creatorProfile.email} (expires in ${daysLeft})`);
    }

    return;
  } catch (error) {
    console.error("❌ Error sending Lite Plan downgrade reminders:", error);
  }
};

// send reminder to those subscribtion have expire but have current month grace
const sendPlanExpirationReminder = async () => {
  try {
    // Fetch Lite Plan subscriptions expiring soon
    const subscriptions = await Subscription.findAll({
      where: {
        planType: "Lite",
        endDate: {
          [Op.lt]: new Date(),
        },
      },
    });

    if (subscriptions.length === 0) {
      console.log("✅ No Lite plan subscriptions requiring reminders today.");
      return;
    }

    // Send reminders
    for (const sub of subscriptions) {
     

      const creatorProfile = await CreatorProfile.findOne({ creatorId: sub.creatorId });
      if (!creatorProfile) {
        console.log(`❌ Creator profile not found for ID: ${sub.creatorId}`);
        continue;
      }

      const message = `
        Hello ${creatorProfile.fullName}, Your Lite Plan subscription will expire on March 31st 2025. Your Business website on https://${sub.ecosystemDomain}.dimpified.com will be disabled if you do not upgrade to a paid plan.

        Upgrade now: https://dimpified.com/auth/login?subscription
      `;

      // Send email reminder
      await sendLiteDeactionReminder({
        day: "on March 31st 2025",
        email: creatorProfile.email,
        organizationName: creatorProfile.fullName,
        websiteUrl: `https://${sub.ecosystemDomain}.dimpified.com`,
        plan: sub.planType,
        formattedDate: sub.endDate,
      });

      // Send SMS reminder
      await newsSendSMS(creatorProfile.phoneNumber, message, "plain");

      console.log(`📩 Reminder sent to ${creatorProfile.email} (expires in ${daysLeft})`);
    }

    return;
  } catch (error) {
    console.error("❌ Error sending Lite Plan downgrade reminders:", error);
  }
};


module.exports = { sendSubscriptionReminders, sendLitePlanDownGradeReminder, sendPlanExpirationReminder, sendPlanExpirationReminder };
