const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const account = new Schema({
  userName: String,
  password: String,
  thirdPartyLogin: [String],
  info: {
    name: String,
    isFemale: Boolean,
    avatar: String,
  },
  filmInventory: [{ animeId: String }],
});
module.exports = mongoose.model("accounts", account);
