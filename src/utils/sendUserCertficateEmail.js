const sendEmail = require("./sendEmail");


const sendUserCertificate = async ({
    //recipientName,
    recipientEmail,
    pdfBuffer }) => {
    const emailOptions = {
        html: '<p>Please find your certificate attached.</p>',
        to: recipientEmail,
        subject: 'Your Certificate',
        attachments: [
            {
                filename: 'certificate.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    return sendEmail(emailOptions);
};

module.exports = sendUserCertificate;