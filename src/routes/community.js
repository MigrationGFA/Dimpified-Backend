const express = require("express");
const {
  createCommunityHeader,
  createPost,
  getCommunityWithPosts,
  commentOnPost,
  getPostComments,
  updateBackgroundCover,
  updateImage,
  pendingPosts,
  approveOrRejectPost,
  likeOrUnlikePost,
  replyComment,
  getReplies,
  likeOrUnlikeReply,
  likeOrUnlikeComment
} = require("../controllers/FeatureController/Community/community");

const 
  authenticatedUser
 = require("../middleware/authentication")

const router = express.Router();
const multer = require("multer");
const { communityStorage, postStorage } = require("../helper/multerUpload");
const getUserProfile = require("../controllers/FeatureController/Community/UsersProfile");

const upload = multer({
  storage: communityStorage,
  limits: {
    fileSize: 104857600, // 100MB
  },
});

const postUpload = multer({
  storage: postStorage,
  limits: {
    fileSize: 104857600, // 100MB
  },
});

router.post("/create-community-header", authenticatedUser, createCommunityHeader);

router.post("/create-post", postUpload.array("image"), authenticatedUser, createPost);
router.get("/community/:ecosystemDomain", authenticatedUser, getCommunityWithPosts);
router.post("/comment", authenticatedUser, commentOnPost);
router.get("/post-comments/:postId", authenticatedUser, getPostComments);
router.patch(
  "/update-backgroundCover/:ecosystemDomain",
  upload.single("backgroundCover"),
  authenticatedUser,
  updateBackgroundCover
);
router.get("/pending-posts/:ecosystemDomain", authenticatedUser, pendingPosts);
router.patch(
  "/update-image/:ecosystemDomain",
   authenticatedUser,
  upload.single("image"),
 
  updateImage
);
router.patch("/validate-post", authenticatedUser, approveOrRejectPost);

router.post("/like-unlike-post", authenticatedUser, likeOrUnlikePost);
router.post("/reply-to-comment", authenticatedUser, replyComment);
router.get("/replies/:commentId", authenticatedUser, getReplies);
router.post("/like-unlike-reply", authenticatedUser, likeOrUnlikeReply)
router.post("/like-unlike-comment", authenticatedUser, likeOrUnlikeComment)



//Get User profile endpoint
router.get("/get-user-profile/:ecosystemDomain", getUserProfile);

module.exports = router;
