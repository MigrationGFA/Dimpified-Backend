const cron = require("node-cron");
const { sendSubscriptionReminders, sendLitePlanDownGradeReminder } = require("../../helper/subscriptionHelper");

// Schedule the cron job to run every day at 8 AM
cron.schedule("0 9 * * *", async () => {
    console.log("🔄 Running subscription reminder job...");
    await sendSubscriptionReminders();
    await sendLitePlanDownGradeReminder();
});

module.exports = cron;
