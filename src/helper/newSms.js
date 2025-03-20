const axios = require("axios");
const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("0")) {
    return `234${phoneNumber.slice(1)}`;
  }
  
  return phoneNumber; 
};

const newsSendSMS = async (to, sms, type) => {
  try {
    const newPhoneNumber = formatPhoneNumber(to)
    const data = {
      to: newPhoneNumber,
      from: 'DIMP',
      sms,
      type,
      api_key: process.env.TERMII_SMS_API,
      channel: "generic",
    };
    console.log("this is data", data)

    const response = await axios.post("https://v3.api.termii.com/api/sms/send", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.response?.data || error.message);
    throw new Error(`Failed to send SMS: ${error}`);
  }
};


module.exports = newsSendSMS;
