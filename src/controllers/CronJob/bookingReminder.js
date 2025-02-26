const cron = require('node-cron');
const newsSendSMS = require("../../helper/newSms");
const Booking = require("../../models/DimpBooking");

// Format phone number for Nigeria (Remove leading zero and add +234)
const formatPhoneNumber = (phoneNumber) => {
  return phoneNumber.startsWith("0") ? `234${phoneNumber.slice(1)}` : phoneNumber;
};

// Cron job runs every minute
// cron.schedule('* * * * *', async () => {
//   console.log('Checking for upcoming bookings...');

//   const now = new Date();
//   const reminders = [
//     {
//       timeOffset: 24 * 60 * 60 * 1000,
//       getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service}service is scheduled for tomorrow.`
//     },
//     {
//       timeOffset: 3 * 60 * 60 * 1000,
//       getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} service is in 3 hours.`
//     },
//     {
//       timeOffset: 1 * 60 * 60 * 1000,
//       getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} service is in 1 hour.`
//     }
//   ];

//   for (const reminder of reminders) {
//     const targetTime = new Date(now.getTime() + reminder.timeOffset);

//     // Find bookings within the specified time range
//     const bookings = await Booking.find({
//       date: { $eq: targetTime.toISOString().split("T")[0] }, // Match exact date
//       time: { $eq: targetTime.toTimeString().split(" ")[0].slice(0, 5) } // Match exact time (HH:mm)
//     });

//     for (const booking of bookings) {
//       const formattedPhone = formatPhoneNumber(booking.phone);
//       const message = reminder.getMessage(booking);

//       try {
//         await newsSendSMS(formattedPhone, message, "plain");
//         console.log(`✅ SMS sent to ${formattedPhone}: ${message}`);
//       } catch (error) {
//         console.error(`❌ Failed to send SMS to ${formattedPhone}:`, error.message);
//       }
//     }
//   }
// });


cron.schedule('* * * * *', async () => {
  console.log('Checking for upcoming bookings...');

  const nowUTC = new Date().toISOString(); // Current UTC time
  const reminders = [
    { 
      timeOffset: 24 * 60 * 60 * 1000, // 24 hours
      getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} is scheduled for tomorrow.` 
    },
    { 
      timeOffset: 3 * 60 * 60 * 1000, // 3 hours
      getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} is in 3 hours.` 
    },
    { 
      timeOffset: 1 * 60 * 60 * 1000, // 1 hour
      getMessage: (booking) => `Reminder: Your booking from ${booking.ecosystemDomain} for ${booking.service} is in 1 hour.` 
    }
  ];

  for (const reminder of reminders) {
    console.log("this is here")
    const targetStart = new Date(nowUTC.getTime() + reminder.timeOffset - 30000); // 30 seconds before
const targetEnd = new Date(targetStart.getTime() + 120000); // 2 minutes after
    console.log(`Checking bookings for reminder (${reminder.timeOffset / 3600000} hours)`);
  console.log("Query range:", {
    $gte: targetStart.toISOString(),
    $lt: targetEnd.toISOString()
  });
const bookings = await Booking.find({
  fullTime: { $gte: targetStart.toISOString(), $lt: targetEnd.toISOString() }
});
    
    console.log("this is booking", bookings)

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
