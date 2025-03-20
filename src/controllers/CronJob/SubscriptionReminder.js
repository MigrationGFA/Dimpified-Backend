const cron = require("node-cron");
const { sendSubscriptionReminders } = require("../../helper/subscriptionHelper");

// Schedule the cron job to run every day at 8 AM
cron.schedule("0 8 * * *", async () => {
    console.log("🔄 Running subscription reminder job...");
    await sendSubscriptionReminders();
});

module.exports = cron;
