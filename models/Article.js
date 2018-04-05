const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodbErrorHandler = require("mongoose-mongodb-errors");
mongoose.Promise = global.Promise;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: "Please supply a title",
      trim: true
    },
    coverImage: {

    },
    youtubeVideo: {
      type: String
    },
    html: {
      type: String,
      required: "Please supply article content"
    },
    published: {
      type: Date,
      default: Date.now()
    }
  },
  {
    timestamps: true
  }
);

// Get latest X articles
articleSchema.statics.getLatestArticles = function ({
  limit = 8,
  filter = {},
  search = null,
  showUnpublished = false
} = {}) {
  if (search) {
    filter['$or'] = [
      { title: { $regex: search, $options: "i" } },
      { html: { $regex: search, $options: "i" } }
    ]
  }
  if (!showUnpublished) {
    filter.published = { $lt: Date.now() }
  }
  return this
    .find(filter)
    .sort({ published: -1 })
    .limit(limit)
};

articleSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Article", articleSchema);
