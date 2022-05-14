const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
  name: String,
  artist: String,
  cover: String,
  url: String,
  palette: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Album", AlbumSchema);
