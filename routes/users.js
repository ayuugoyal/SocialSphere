const router = require("express").Router();
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const dotenv = require("dotenv");
const isAuthrorized = require("../middlewares/authorization");

dotenv.config();

router.get("/user", isAuthrorized, async (req, res) => {
  try {
    const user = req.user;
    !user &&
      res
        .status(400)
        .json({ success: false, message: "No user or email exist" });
    if (user) {
      const userDetails = {
        username: user.username,
        name: user.name,
        email: user.email,
        followers: user.followers.length,
        following: user.following.length,
      };
      res.status(200).json({
        success: true,
        userDetails: userDetails,
        message: "User Details Find",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/follow/:id", isAuthrorized, async (req, res) => {
  const user = req.user;
  const userId = user._id.toHexString();
  console.log(user);
  if (userId !== req.params.id) {
    const user2 = await User.findById(req.params.id);
    if (user2) {
      try {
        const currentUser = await User.findById(userId);
        if (!user2.followers.includes(userId)) {
          await user2.updateOne({ $push: { followers: userId } });
          await currentUser.updateOne({ $push: { following: req.params.id } });
          res.status(200).json({
            success: true,
            message: "this user is now being followed",
          });
        } else {
          res.status(403).json({
            success: false,
            message: "You already followed this user",
          });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
    } else {
      res.status(400).json({ success: false, message: "no user found" });
    }
  } else {
    res
      .status(403)
      .json({ success: false, message: "you cannot follow yourself" });
  }
});

router.post("/unfollow/:id", isAuthrorized, async (req, res) => {
  const user = req.user;
  console.log(user._id.toHexString());
  const userId = user._id.toHexString();
  console.log(user);
  if (userId !== req.params.id) {
    const user2 = await User.findById(req.params.id);
    if (user2) {
      try {
        const currentUser = await User.findById(userId);
        if (user2.followers.includes(userId)) {
          await user2.updateOne({ $pull: { followers: userId } });
          await currentUser.updateOne({ $pull: { following: req.params.id } });
          res.status(200).json({
            success: true,
            message: "this user is now being unfollowed",
          });
        } else {
          res
            .status(403)
            .json({ success: false, message: "You don't follow this user" });
        }
      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
    } else {
      res.status(404).json({ success: false, message: "no user found" });
    }
  } else {
    res
      .status(403)
      .json({ success: false, message: "you cannot unfollow yourself" });
  }
});

router.put("/like/:id", isAuthrorized, async (req, res) => {
  try {
    const user = req.user;
    const post = await Post.findById(req.params.id);
    !post &&
      res.status(404).json({ success: false, message: "post doesn't exist" });
    if (post) {
      if (!post.likes.includes(user._id.toHexString())) {
        await post.updateOne({ $push: { likes: user._id.toHexString() } });
        res.status(200).json({ success: true, message: "post Liked" });
      } else {
        await post.updateOne({ $pull: { likes: user._id.toHexString() } });
        res.status(200).json({ success: true, message: "post UnLiked" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/comment/:id", isAuthrorized, async (req, res) => {
  try {
    const user = req.user;
    const post = await Post.findById(req.params.id);
    !post &&
      res.status(404).json({ success: false, message: "post doesn't exist" });
    if (post) {
      !req.body.comment &&
        res
          .status(400)
          .json({ success: false, message: "provide a comment for the post" });
      if (req.body.comment) {
        const commentDetails = {
          userId: user._id.toHexString(),
          postId: req.params.id,
          commentdes: req.body.comment,
        };
        const newComment = new Comment(commentDetails);
        const savedComment = await newComment.save();
        const result = {
          postTitle: post.title,
          postDescription: post.desc,
          LikeCount: post.likes.length,
          postComment: {
            CommentId: savedComment._id,
            comment: newComment.commentdes,
          },
        };
        res.status(200).json({
          success: true,
          message: "comment saved",
          postDetail: result,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/all_posts", isAuthrorized, async (req, res) => {
  try {
    const user = req.user;
    const posts = await Post.find({ userId: user._id.toHexString() });
    console.log(posts);

    const allPostsDetails = [];
    await Promise.all(
      posts.map(async (post) => {
        const postComments = await Comment.find({
          postId: post._id.toHexString(),
        });
        const allcomments = [];
        postComments.forEach((comment) => {
          allcomments.push(comment.commentdes);
        });
        const postData = {
          postId: post._id.toHexString(),
          Title: post.title,
          Description: post.desc,
          Created_at: post.createdAt,
          postComments: allcomments,
          postLikes: post.likes.length,
        };
        allPostsDetails.push(postData);
      })
    );

    console.log(allPostsDetails);

    if (allPostsDetails.length != 0) {
      res.status(200).json({
        success: true,
        message: "All Post Found",
        AllPosts: allPostsDetails,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "no Post is created by user",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
