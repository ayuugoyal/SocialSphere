const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const dotenv = require("dotenv");
const isAuthrorized = require("../middlewares/authorization");

dotenv.config();

router.post("/", isAuthrorized, async (req, res) => {
  try {
    const user = req.user;
    if (req.body.title && req.body.description) {
      const postDetails = {
        userId: user._id.toHexString(),
        title: req.body.title,
        desc: req.body.description,
      };
      const newPost = new Post(postDetails);
      const savedPost = await newPost.save();
      const result = {
        postId: savedPost._id,
        Title: savedPost.title,
        Description: savedPost.desc,
        CreatedTime: savedPost.createdAt,
      };
      res
        .status(200)
        .json({ success: true, message: "post saved", postDetail: result });
    } else {
      res.status(400).json({
        success: false,
        message: "provide required details for creating a post",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.delete("/:id", isAuthrorized, async (req, res) => {
  try {
    const user = req.user;
    const post = await Post.findById(req.params.id);

    console.log(post);

    if (post) {
      if (user._id.toHexString() === post.userId) {
        await post.deleteOne();
        res
          .status(200)
          .json({ success: true, message: "Post Deleted Successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, message: "This post is not posted by you" });
      }
    } else {
      res.status(404).json({ success: false, message: "Post Doesn't exist" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const postCreator = await User.findById(post.userId);
    const postComments = await Comment.find({ postId: req.params.id });
    console.log(post);
    if (post) {
      const commentDescriptions = [];

      postComments.forEach((comment) => {
        commentDescriptions.push(comment.commentdes);
      });

      const postData = {
        postID: post._id.toHexString(),
        postTitle: post.title,
        postDescription: post.description,
        createdBy: postCreator.name,
        createdAt: post.createdAt,
        likeCount: post.likes.length,
        PostComments: commentDescriptions,
      };
      res
        .status(200)
        .json({ success: true, message: "post find", postDetails: postData });
    } else {
      res.status(404).json({
        success: false,
        message: "the Post doesn't exist",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
