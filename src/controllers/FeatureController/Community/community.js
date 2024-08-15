const { Community, Post, Comment } = require("../../../models/Community");
const Creator = require("../../../models/Creator");
const Ecosystem = require("../../../models/Ecosystem");
const EcosystemUser = require("../../../models/EcosystemUser");

const createCommunityHeader = async (req, res) => {
  try {
    const { creatorId, ecosystemDomain, sectors, description, rules } =
      req.body;
    console.log("body:", req.body);
    const requiredFields = [
      "creatorId",
      "ecosystemDomain",
      "sectors",
      "description",
      "rules",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.json(400).json({ message: "Invalid creator Id " });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const community = new Community({
      creatorId,
      ecosystemDomain,
      sectors,
      description,
      rules,
    });

    await community.save();

    ecosystem.communityId = community.id;
    ecosystem.communityCreated = "true";

    await ecosystem.save();

    return res.status(200).json({ message: "Community created succesfully" });
  } catch (error) {
    console.error("Error creatring community:", error);
    res.status(500).json({ message: "Failed to create community" });
  }
};

const createPost = async (req, res) => {
  try {
    const { authorId, userType, ecosystemDomain, content } = req.body;

    const requiredFields = [
      "authorId",
      "userType",
      "ecosystemDomain",
      "content",
    ];

    // Check for missing fields and return a detailed error message
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Either content or at least one image must be provided",
      });
    }
    const author = await EcosystemUser.findByPk(authorId);
    if (!author) {
      return res.status(400).json({ message: "Author does not exist" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const communityId = ecosystem.communityId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    community.totalPost += 1;

    await community.save();

    const imageLinks = [];
    // If using upload.array("image")
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        imageLinks.push(
          `https://dimpified-backend-development.azurewebsites.net/uploads/posts/${file.filename}`
        );
      });
    }

    let status = "pending";
    if (userType === "creator") {
      status = "live";
    }

    const post = new Post({
      authorId,
      communityId,
      status,
      userType,
      ecosystemDomain,
      content: content || "",
      images: imageLinks,
    });

    await post.save();

    return res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Failed to create post" });
  }
};

const getCommunityWithPosts = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    if (!ecosystemDomain) {
      return res
        .status(400)
        .json({ message: "Please provide ecosystem domain" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const community = await Community.findById(ecosystem.communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }
    const communityId = community._id;

    //check status for live
    const posts = await Post.find({ communityId, status: 'live' }).sort({
      createdAt: -1,
    });

    // Extract unique author IDs and user types
    const authorData = posts.map((post) => ({
      id: post.authorId,
      type: post.userType,
    }));
    const uniqueAuthors = Array.from(
      new Set(authorData.map(JSON.stringify))
    ).map(JSON.parse);

    const creatorIds = uniqueAuthors
      .filter((author) => author.type === "creator")
      .map((author) => author.id);
    const ecosystemUserIds = uniqueAuthors
      .filter((author) => author.type === "user")
      .map((author) => author.id);

    const creators = await Creator.findAll({
      where: { id: creatorIds },
      attributes: ["id", "imageUrl", "organizationName"],
    });

    const ecosystemUsers = await EcosystemUser.findAll({
      where: { id: ecosystemUserIds },
      attributes: ["id", "imageUrl", "username"],
    });

    const userImages = {};
    const userNames = {};

    creators.forEach((creator) => {
      userImages[creator.id] = creator.imageUrl;
      userNames[creator.id] = creator.organizationName;
    });

    ecosystemUsers.forEach((user) => {
      userImages[user.id] = user.imageUrl;
      userNames[user.id] = user.username;
    });

    // const postsWithImages = posts.map((post) => ({
    //   ...post.toObject(),
    //   userImage: userImages[post.authorId] || null,
    //   username: userNames[post.authorId] || null,
    // }));


    // Fetch comments count for each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ postId: post._id });
        return {
          ...post.toObject(),
          userImage: userImages[post.authorId] || null,
          username: userNames[post.authorId] || null,
          likes: post.likes,
          commentsCount,
        };
      })
    );

    return res.status(200).json({
      community,
      posts: postsWithDetails,
    });
  } catch (error) {
    console.error(
      "Error fetching community with posts and user images:",
      error
    );
    return res.status(500).json({ message: "Failed to fetch community data" });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { postId, userId, ecosystemDomain, comment, userType } = req.body;

    const requiredFields = [
      "postId",
      "userId",
      "comment",
      "ecosystemDomain",
      "userType",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    const newComment = new Comment({
      postId,
      userId,
      ecosystemDomain,
      comment,
      userType,
    });

    await newComment.save();

    return res
      .status(201)
      .json({ message: "Comment created successfully", comment: newComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({ message: "Failed to create comment" });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });

    if (!comments.length) {
      return res
        .status(404)
        .json({ message: "No comments found for this post" });
    }

    const userData = comments.map((comment) => ({
      id: comment.userId,
      type: comment.userType,
    }));
    const uniqueUsers = Array.from(new Set(userData.map(JSON.stringify))).map(
      JSON.parse
    );

    const creatorIds = uniqueUsers
      .filter((user) => user.type === "creator")
      .map((user) => user.id);
    const ecosystemUserIds = uniqueUsers
      .filter((user) => user.type === "user")
      .map((user) => user.id);

    const creators = await Creator.findAll({
      where: { id: creatorIds },
      attributes: ["id", "imageUrl", "organizationName"],
    });

    const ecosystemUsers = await EcosystemUser.findAll({
      where: { id: ecosystemUserIds },
      attributes: ["id", "imageUrl", "username"],
    });

    const userImages = {};
    const userNames = {};

    creators.forEach((creator) => {
      userImages[creator.id] = creator.imageUrl;
      userNames[creator.id] = creator.organizationName;
    });

    ecosystemUsers.forEach((user) => {
      userImages[user.id] = user.imageUrl;
      userNames[user.id] = user.username;
    });

    const commentsWithImages = comments.map((comment) => ({
      ...comment.toObject(),
      userImage: userImages[comment.userId] || null,
      userName: userNames[comment.userId] || null,
    }));

    return res.status(200).json({ comments: commentsWithImages });
  } catch (error) {
    console.error("Error getting post comments:", error);
    return res.status(500).json({ message: "Failed to get comments" });
  }
};

const updateBackgroundCover = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;
    if (!ecosystemDomain) {
      return res.json(400).json({ message: "Please provide ecosystem Domain" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }
    const communityId = ecosystem.communityId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const backgroundCoverLink = `https://dimpified-backend-development.azurewebsites.net/uploads/communityFiles/${req.file.filename}`;
    community.backgroundCover = backgroundCoverLink;
    await community.save();

    return res.status(200).json({
      message: "Background cover updated successfully",
      backgroundCover: backgroundCoverLink,
    });
  } catch (error) {
    console.error("Error updating background cover:", error);
    return res
      .status(500)
      .json({ message: "Failed to update background cover" });
  }
};

const updateImage = async (req, res) => {
  try {
    const { ecosystemDomain } = req.params;

    if (!ecosystemDomain) {
      return res.json(400).json({ message: "Please provide ecosystem Domain" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ecosystem = await Ecosystem.findOne({ ecosystemDomain });
    if (!ecosystem) {
      return res.status(404).json({ message: "Ecosystem not found" });
    }

    const communityId = ecosystem.communityId;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const imageLink = `https://dimpified-backend-development.azurewebsites.net/uploads/communityFiles/${req.file.filename}`;
    community.image = imageLink;
    await community.save();

    return res
      .status(200)
      .json({ message: "Image updated successfully", image: imageLink });
  } catch (error) {
    console.error("Error updating image:", error);
    return res.status(500).json({ message: "Failed to update image" });
  }
};

const pendingPosts = async (req, res) => {
  try {
    const ecosystemDomain = req.params.ecosystemDomain;

    const pendingPosts = await Post.find({
      ecosystemDomain,
      status: "pending",
    });

    if (pendingPosts.length === 0) {
      return res.status(404).json({ message: "No pending posts found" });
    }

    return res.status(200).json(pendingPosts);
  } catch (error) {
    console.error("Error fetching pending posts:", error);
    return res.status(500).json({ message: "Failed to fetch pending posts" });
  }
};

const approveOrRejectPost = async (req, res) => {
  try {
    const { status, postId } = req.body;

    if (!status || !["live", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({
          message:
            'Invalid status. Status must be either "live" or "rejected".',
        });
    }
    if (!postId) {
      return res.status(400).json({ message: "Please provide post id" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.status = status;
    await post.save();

    return res
      .status(200)
      .json({ message: `Post status updated to ${status}` });
  } catch (error) {
    console.error("Error updating post status:", error);
    return res.status(500).json({ message: "Failed to update post status" });
  }
};

const likeOrUnlikePost = async (req, res) => {
  try {
    const { communityId, userId, postId } = req.body

    if (!communityId || !postId || !userId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    //find post by communityId and postId
    const post = await Post.findOne({ _id: postId, communityId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }


    //check if post has been liked
    const hasLiked = post.likesUserId.includes(userId);

    if (hasLiked) {
      // If already liked, remove the like
      post.likesUserId = post.likesUserId.filter(id => id !== userId);
      post.likes -= 1; // Decrease the likes count
    } else {
      // If not liked, add the like
      post.likesUserId.push(userId);
      post.likes += 1; // Increase the likes count
    }
    await post.save();

    return res.status(200).json({
      message: hasLiked ? "Like removed" : "Post liked",
      post: {
        postId: post._id,
        likes: post.likes,
      },
    });

  } catch (error) {
    console.error("Error liking or unliking post:", error);
    return res.status(500).json({ message: "Failed to like or unlike post" });
  }
}
module.exports = {
  createCommunityHeader,
  createPost,
  getCommunityWithPosts,
  commentOnPost,
  getPostComments,
  pendingPosts,
  updateImage,
  updateBackgroundCover,
  approveOrRejectPost,
  likeOrUnlikePost
};
