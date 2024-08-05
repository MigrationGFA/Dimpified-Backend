const mongoose = require("mongoose");

const coomunityHeader = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
    },
    ecosystemDomain: {
      type: String,
      required: true,
    },
    totalPost: {
      type: Number,
      default: 0,
    },
    sectors: {
      type: [String],
      default: [],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    backgroundCover: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dimpCommunity",
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    ecosystemDomain: {
      type: String,
      required: true,
    },
    content: { type: String },
    images: [{ type: String }],
    likes: {
      type: Number,
      default: 0,
    },
    likesUserId: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "live", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dimpCommunityPost",
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
    ecosystemDomain: {
      type: String,
      required: true,
    },
    likesUserId: [{ type: String }],
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("dimpCommunityPost", postSchema);
const Comment = mongoose.model("dimpComment", commentSchema);
const Community = mongoose.model("dimpCommunity", coomunityHeader);

module.exports = { Post, Comment, Community };
