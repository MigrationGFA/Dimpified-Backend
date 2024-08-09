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
} = require("../controllers/FeatureController/Community/community");
const router = express.Router();
const multer = require("multer");
const { communityStorage, postStorage } = require("../helper/multerUpload");

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

router.post("/create-community-header", createCommunityHeader);

router.post("/create-post", postUpload.array("image"), createPost);
router.get("/community/:ecosystemDomain", getCommunityWithPosts);
router.post("/comment", commentOnPost);
router.get("/post-comments/:postId", getPostComments);
router.patch(
  "/update-backgroundCover/:ecosystemDomain",
  upload.single("backgroundCover"),
  updateBackgroundCover
);
router.get("/pending-posts/:ecosystemDomain", pendingPosts);
router.patch(
  "/update-image/:ecosystemDomain",
  upload.single("image"),
  updateImage
);
router.patch("/validate-post", approveOrRejectPost);

module.exports = router;
