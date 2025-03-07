const axios = require("axios");

const newsSendSMS = async (to, sms, type) => {
  try {
    const data = {
      to,
      from: "DIMP",
      sms,
      type,
      api_key: process.env.TERMII_SMS_API,
      channel: "generic",
    };
    console.log("this is data", data);

    const response = await axios.post(
      "https://v3.api.termii.com/api/sms/send",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(`Failed to send SMS: ${error}`);
  }
};

module.exports = newsSendSMS;
