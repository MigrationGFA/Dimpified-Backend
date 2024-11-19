const axios = require('axios');

// Utility function to format phone number
const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("0")) {
    return `234${phoneNumber.slice(1)}`;
  }
  return phoneNumber;
};

// Function to send SMS to PHP endpoint
const sendSMSToPhpEndpoint = async (phoneNumber, OTP) => {
  try {
    // Format the phone number
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    // Construct the message
    const message = `Dimp, Verify your account on dimp with ${OTP}!`;

    // API Endpoint
    const url = 'https://gfa-tech.com/api/sms.php';

    // Request payload
    const payload = {
      telephone: phoneNumber,
      message: message,
    };

    console.log("Sending payload:", payload);

    // Send POST request
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json', // Set headers for JSON payload
      },
    });

    console.log('SMS sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendSMSToPhpEndpoint;