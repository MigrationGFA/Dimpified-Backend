const mongoose = require("mongoose")

const replySchema = new mongoose.Schema(
    {

        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "dimpComment", // Reference to the Comment model
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        userType: {
            type: String,
            required: true,
        },

        likes: {
            type: Number,
            default: 0,
        },
        likesUserId: [{ type: String }],
        reply: {
            type: String,
            required: true,
        },
        ecosystemDomain: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

const Reply = mongoose.model("dimpReply", replySchema);

module.exports = Reply