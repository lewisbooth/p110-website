const mongoose = require("mongoose")
const Schema = mongoose.Schema
const mongodbErrorHandler = require("mongoose-mongodb-errors")
const validator = require("validator")
const { removeNewLines } = require("../helpers/removeNewLines")
const { updateMixtapeTitle } = require("../helpers/uploadMixtapeFiles")
const slugify = require("slugify")
mongoose.Promise = global.Promise

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
    },
    type: {
      type: String
    },
    externalLink: {
      type: String,
      validate: {
        validator: function (v) {
          return validator.isURL(v)
        },
        message: '{VALUE} is not a valid URL'
      },
      required: function () {
        return this.type === "link"
      }
    },
    filesAvailable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    virtuals: true
  }
)

mixtapeSchema.set('toJSON', { virtuals: true })

mixtapeSchema.virtual('artistList')
  .get(function () {
    return this.artists.join(", ")
  })

mixtapeSchema.virtual('fullTitle')
  .get(function () {
    return `${this.artistList} - ${this.title}`
  })

mixtapeSchema.virtual('image')
  .get(function () {
    return this.coverAvailable ?
      `/images/mixtapes/${this._id}/large.jpg` :
      "/images/mixtapes/mixtape-default.png"
  })

mixtapeSchema.virtual('fileURL')
  .get(function () {
    return this.type === "files" ?
      `/mixtapes/${this._id}/${this.fullTitle}.zip` :
      this.externalLink
  })

mixtapeSchema.pre('save', async function (next) {
  if (this.type !== "link")
    return
  if (!this.externalLink.startsWith("http"))
    this.externalLink = "http://" + this.externalLink
  next()
})

// Get latest X mixtapes
mixtapeSchema.statics.getLatestMixtapes = function ({
  limit = 6,
  filter = {},
  skip = 0,
  sort = { releaseDate: -1 },
  search = null,
  exclude = null,
  showUnpublished = false
} = {}) {

  if (search)
    filter['$or'] = [
      { title: { $regex: search, $options: "i" } },
      { artists: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ]

  if (!showUnpublished)
    filter.published = true

  if (exclude)
    filter._id = { $ne: exclude }

  return this
    .find(filter)
    .sort(sort)
    .limit(limit)
    .skip(skip)
}


mixtapeSchema.plugin(mongodbErrorHandler)

module.exports = mongoose.model("Mixtape", mixtapeSchema)
