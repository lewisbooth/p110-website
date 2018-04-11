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
    required: "Please supply a title",
    trim: true
  },
  description: {
    type: String,
    required: "Please supply a description"
  },
  category: {
    type: String,
    required: "Please supply a category"
  },
  published: {
    type: Date
  },
  viewCountHistory: Object,
  rawData: {
    type: Object,
    required: "Please supply the Youtube data"
  }
});

videoSchema.plugin(mongodbErrorHandler);

videoSchema.pre('save', async function (next) {
  this.published = Date.parse(this.rawData.snippet.publishedAt)
  next()
})

// Get latest X videos
videoSchema.statics.getLatestVideos = function ({
  limit = 8,
  exclude = null,
  filter = {}
} = {}) {
  if (exclude) {
    filter.youtubeId = { $ne: exclude }
  }
  return this
    .find(filter)
    .sort({ published: -1 })
    .limit(limit)
};

module.exports = mongoose.model("Video", videoSchema);
