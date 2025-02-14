const cron = require('node-cron');
const newsSendSMS = require("../helper/newSms");
const Booking = require("../../models/DimpBooking");

// Format phone number for Nigeria (Remove leading zero and add +234)
const formatPhoneNumber = (phoneNumber) => {
  return phoneNumber.startsWith("0") ? `234${phoneNumber.slice(1)}` : phoneNumber;
};

// Cron job runs every minute
cron.schedule('* * * * *', async () => {
  console.log('Checking for upcoming bookings...');

  const now = new Date();
  const reminders = [
    { 
      timeOffset: 24 * 60 * 60 * 1000, 
      getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service}service is scheduled for tomorrow.` 
    },
    { 
      timeOffset: 3 * 60 * 60 * 1000, 
      getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} service is in 3 hours.` 
    },
    { 
      timeOffset: 1 * 60 * 60 * 1000, 
      getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} service is in 1 hour.` 
    }
  ];

  for (const reminder of reminders) {
    const targetTime = new Date(now.getTime() + reminder.timeOffset);

    // Find bookings within the specified time range
    const bookings = await Booking.find({
      date: { $eq: targetTime.toISOString().split("T")[0] }, // Match exact date
      time: { $eq: targetTime.toTimeString().split(" ")[0].slice(0, 5) } // Match exact time (HH:mm)
    });

    for (const booking of bookings) {
      const formattedPhone = formatPhoneNumber(booking.phone);
      const message = reminder.getMessage(booking);

      try {
        await newsSendSMS(formattedPhone, message, "plain");
        console.log(`✅ SMS sent to ${formattedPhone}: ${message}`);
      } catch (error) {
        console.error(`❌ Failed to send SMS to ${formattedPhone}:`, error.message);
      }
    }
  }
});

console.log('📅 Reminder job is running...');
