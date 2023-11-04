const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const content = new Schema({
  userId: String,
  comment: String,
  createdAt: Number,
  image: String,
});
const comment = new Schema({
  animeId: String,
  content: [content],
});
module.exports = mongoose.model("comments", comment);
