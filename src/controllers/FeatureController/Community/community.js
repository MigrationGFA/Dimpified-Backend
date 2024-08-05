const { Community, Post, Comment } = require("../../../models/Community");
const Creator = require("../../../models/Creator");
const EcosystemUser = require("../../../models/EcosystemUser");
const Ecosystem = require("../../../models/Ecosystem");

const createCommunityHeader = async (req, res) => {
  try {
    const { creatorId, ecosystemDomain, sectors, description, rules } =
      req.body;

    if (!creatorId || !ecosystemDomain || !sectors || !description || !rules) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    const creator = await Creator.findByPk(creatorId);
    if (!creator) {
      return res.json(400).json({ message: "Invalid creator Id " });
    }

    let imageLink;
    if (req.files && req.files.image && req.files.image.length > 0) {
      imageLink = `https://dimpified-backend-development.azurewebsites.net/uploads/communityFiles/${req.files.image[0].filename}`;
    }

    let backgroundCoverLink;
    if (
      req.files &&
      req.files.backgroundCover &&
      req.files.backgroundCover.length > 0
    ) {
      backgroundCoverLink = `https://dimpified-backend-development.azurewebsites.net/uploads/communityFiles/${req.files.backgroundCover[0].filename}`;
    }

    const community = new Community({
      creatorId,
      ecosystemDomain,
      sectors,
      description,
      rules,
      image: imageLink,
      backgroundCover: backgroundCoverLink,
    });

    await community.save();
    return res.status(200).json({ message: "Community created succesfully" });
  } catch (error) {
    console.error("Error creatring community:", error);
    res.status(500).json({ message: "Failed to create community" });
  }
};

const createPost = async (req, res) => {
  try {
    console.log("files:", req.files);
    const { authorId, communityId, userType, ecosystemDomain, content } =
      req.body;

    if (!authorId || !communityId || !userType || !ecosystemDomain) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Either content or at least one image must be provided",
      });
    }
    const imageLinks = [];
    // If using upload.array("image")
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        imageLinks.push(
          `https://dimpified-backend-development.azurewebsites.net/uploads/posts/${file.filename}`
        );
      });
    }
    console.log("Links:", imageLinks);

    const post = new Post({
      authorId,
      communityId,
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
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const posts = await Post.find({ communityId });

    const authorIds = [...new Set(posts.map((post) => post.authorId))];
    const users = await EcosystemUser.findAll({
      where: { id: authorIds },
      attributes: ["id", "imageUrl"],
    });
    console.log("users:", users);

    const userImages = {};
    users.forEach((user) => {
      userImages[user.id] = user.imageUrl;
    });

    console.log("userImages:", userImages);
    const postsWithImages = posts.map((post) => ({
      ...post.toObject(),
      userImage: userImages[post.authorId] || null,
    }));

    return res.status(200).json({
      community,
      posts: postsWithImages,
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
    const { postId, userId, ecosystemDomain, comment } = req.body;

    if (!postId || !userId || !ecosystemDomain || !comment) {
      return res.status(400).json({ message: "All fields must be filled" });
    }

    const newComment = new Comment({
      postId,
      userId,
      ecosystemDomain,
      comment,
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

    const comments = await Comment.find({ postId });

    if (!comments.length) {
      return res
        .status(404)
        .json({ message: "No comments found for this post" });
    }

    const userIds = [...new Set(comments.map((comment) => comment.userId))];

    const users = await EcosystemUser.findAll({
      where: {
        id: userIds,
      },
    });
    console.log("users:", users);
    const userImages = {};
    users.forEach((user) => {
      userImages[user.id] = user.imageUrl;
    });

    const commentsWithImages = comments.map((comment) => ({
      ...comment.toObject(),
      userImage: userImages[comment.userId] || null,
    }));

    return res.status(200).json({ comments: commentsWithImages });
  } catch (error) {
    console.error("Error getting post comments:", error);
    return res.status(500).json({ message: "Failed to get comments" });
  }
};

const updateBackgroundCover = async (req, res) => {
  try {
    const { communityId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

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
    const { communityId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

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

module.exports = {
  createCommunityHeader,
  createPost,
  getCommunityWithPosts,
  commentOnPost,
  getPostComments,
  updateImage,
  updateBackgroundCover,
};
