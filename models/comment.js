const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    postId: {
      type: String,
      require: true,
    },
    commentdes: {
      type: String,
      max: 500,
      require: true,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
