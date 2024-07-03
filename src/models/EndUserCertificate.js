const mongoose = require("mongoose");

const UserCertificateSchema = new mongoose.Schema({
    certificateNumber: {
        type: String,
        required: true,
    },
    userid: {
        type: Number,
        required: true,
    },
    ecosystemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ecosystem',
        required: true,
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
    logo: {
        type: String,
        required: true,
    },
    backgroundImage: {
        type: String,
        required: true,
    },
})

module.exports = mongoose.model("dimpifiedUserCertificate", UserCertificateSchema);