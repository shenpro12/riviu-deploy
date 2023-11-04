const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const seasonItem = new Schema({
  name: {
    vn: String,
    en: String,
    jp: String,
  },
  season: String,
  thumb_url: String,
  background_url: String,
  description: String,
  release_year: Number,
  views: {
    total_view: Number,
    day: { total: Number, dateOfRecord: Number },
    month: { total: Number, dateOfRecord: Number },
    week: { total: Number, dateOfRecord: Number },
  },
  total_episode: [String],
  total_ep: Number,
  category: [String],
  director: String,
  country: String,
  done: Boolean,
  studio: String,
  rating: Number,
  trailer: String,
  image: String,
  star: [{ userId: String, point: Number }],
  updatedAt: Number,
});
const animeList = new Schema({
  name: {
    vn: String,
    en: String,
    jp: String,
  },
  season: [seasonItem],
});
module.exports = mongoose.model("animes", animeList);
