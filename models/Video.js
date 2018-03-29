const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodbErrorHandler = require("mongoose-mongodb-errors");
mongoose.Promise = global.Promise;

const videoSchema = new Schema({
  youtubeId: {
    type: String,
    required: "Please supply a video ID",
    unique: true
  },
  title: {
    type: String,
    required: "Please supply a title"
  },
  description: {
    type: String,
    required: "Please supply a description"
  },
  category: {
    type: String,
    required: "Please supply a category"
  },
  viewCountHistory: Object,
  rawData: {
    type: Object,
    required: "Please supply the Youtube data"
  }
});

videoSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Video", videoSchema);
