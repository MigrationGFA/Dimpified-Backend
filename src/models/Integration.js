const mongoose = require("mongoose");

const DimpIntegration =  new mongoose.Schema(
    {
    creatorId: {
      type: String,
      required: true,
    },
    ecosystemId: {
      type: String,
      required: true,
    },
    ecosystemDomain: {
      type: String,
      required: true,
    },
    communication: communitySchema,
},

     {
    timestamps: true,
  }
)

module.exports = mongoose.model("DimpIntegration", DimpIntegration);



// Community integration
const communitySchema = new mongoose.Schema({
  enable: { type: Boolean, default: false },
  enableDiscussion: { type: Boolean, default: false },
  permission: {
    allowPost: Boolean,
    allowComment: Boolean,
    allowPoll: Boolean,
  },
  reaction: 
    {
      upvotePost: Boolean,
      downvotePost: Boolean,
      allowPoll: Boolean,
    },
  attachement: 
    {
      image: Boolean,
      article: Boolean,
    },
  courseDiscussion: 
    {
      playerAndCommunity: Boolean,
      player: Boolean,
    }
});

