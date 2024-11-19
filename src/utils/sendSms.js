const axios = require('axios');


const sendSMS = async ({username, apikey, sender, message, recipients, dndSender = true}) => {
    const url = 'https://api.ebulksms.com/sendsms.json';
    const payload = {
        SMS: {
            auth: {
                username,
                apikey,
            },
            message: {
                sender,
                messagetext: message,
                flash: '0',
            },
            recipients: {
                gsm: recipients,
            },
            dndsender: dndSender ? 1 : 0,
        },
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = { sendSMS };
