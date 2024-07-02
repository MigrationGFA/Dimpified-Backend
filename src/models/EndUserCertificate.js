const mongoose = require("mongoose");

const UserCertificateSchema = new mongoose.Schema({
    certificateNumber: {
        type: String,
        required: true,
    },
    userid: {
        type: Number
    },
    ecosystemId: {
        type: Number
    },
    title: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dimpifiedCourse',
        required: true,
    },
    recipientName: {
        type: String,
        required: true,
    },
    recipientEmail: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true,
    },
    skills: [{
        type: String,
    }],
    issuerName: {
        type: String,
        required: true,
    },
    issuerTitle: {
        type: String,
        required: true,
    },
    logoUrl: {
        type: String,
        required: true,
    },
    backgroundImageUrl: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model("dimpifiedUserCertificate", UserCertificateSchema);