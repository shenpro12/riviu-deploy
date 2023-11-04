const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subComment = new Schema({
  commentId: String,
  userId: String,
  comment: String,
  createdAt: Number,
});
module.exports = mongoose.model("subcomments", subComment);
