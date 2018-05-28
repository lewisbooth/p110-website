const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const { removeNewLines } = require("../helpers/removeNewLines");
const { updateMixtapeTitle } = require("../helpers/uploadMixtapeFiles");
const slugify = require("slugify");
mongoose.Promise = global.Promise;

const mixtapeSchema = new Schema(
  {
    title: {
      type: String,
      required: "Please supply a title",
      trim: true
    },
    artists: {
      type: Array,
      trim: true
    },
    description: {
      type: String
    },
    trackListing: [{
      title: String,
      duration: String
    }],
    published: {
      type: Boolean
    },
    releaseDate: {
      type: Date
    },
    coverAvailable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    virtuals: true
  }
);

mixtapeSchema.virtual('artistList')
  .get(function () {
    return this.artists.join(", ")
  });

mixtapeSchema.virtual('fullTitle')
  .get(function () {
    return `${this.artistList} - ${this.title}`
  });

// Get latest X mixtapes
mixtapeSchema.statics.getLatestMixtapes = function ({
  limit = 6,
  filter = {},
  search = null,
  exclude = null,
  showUnpublished = false
} = {}) {

  if (search)
    filter['$or'] = [
      { title: { $regex: search, $options: "i" } },
      { html: { $regex: search, $options: "i" } }
    ]

  if (!showUnpublished)
    filter.published = true

  if (exclude)
    filter._id = { $ne: exclude }

  return this
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
};


mixtapeSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Mixtape", mixtapeSchema);
