const { Op } = require("sequelize");
const Subscription = require("../models/Subscription");
const sendSubscriptionReminder = require("../utils/subscriptionReminder")
const newsSendSMS = require("./newSms")
const CreatorProfile = require("../models/CreatorProfile")

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
                Hello ${sub.username},
                Your subscription plan (${sub.planType}) Plan will expire in ${daysLeft}.
                Please renew your subscription to continue using our services.

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
                Hello ${sub.username},
                Your subscription plan (${sub.planType}) Plan will expire in ${daysLeft}.
                Please renew your subscription to continue using our services.

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

module.exports = { sendSubscriptionReminders, sendLitePlanDownGradeReminder };
