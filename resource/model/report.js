const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const report = new Schema(
  {
    episode: Number,
    animeId: String,
    userId: String,
    report: [String],
  },
  { timestamps: true }
);
module.exports = mongoose.model("reports", report);
