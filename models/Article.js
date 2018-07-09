const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const { removeNewLines } = require("../helpers/removeNewLines");
const slugify = require("slugify");
mongoose.Promise = global.Promise;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: "Please supply a title",
      trim: true
    },
    slug: String,
    cover: {
      type: {
        type: String,
        required: "Please supply an image type",
      },
      youtubeId: {
        type: String
      },
    },
    html: {
      type: String,
      required: "Please supply article content"
    },
    text: {
      type: String
    },
    published: {
      type: Boolean
    }
  },
  {
    timestamps: true
  }
);

articleSchema.set('toJSON', { virtuals: true })

articleSchema.virtual('image')
  .get(function () {
    return this.cover['type'] === "youtube" ?
      `https://i.ytimg.com/vi/${article.cover.youtubeId}/maxresdefault.jpg` :
      `/images/articles/${article._id}/large.jpg`
  })

articleSchema.virtual('thumbnail')
  .get(function () {
    return this.cover['type'] === "youtube" ?
      `https://i.ytimg.com/vi/${article.cover.youtubeId}/mqdefault.jpg` :
      `/images/articles/${article._id}/thumbnail.jpg`
  })

// Get latest X articles
articleSchema.statics.getLatestArticles = function ({
  limit = 8,
  skip = 0,
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
    filter.slug = { $ne: exclude }

  return this
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
};


// Create a slug for the article
// Add an index at the end if multiple articles are found with the same title
articleSchema.pre('save', async function (next) {
  if (this.text) this.text = removeNewLines(this.text)
  if (!this.isModified('title')) {
    return next();
  }
  this.slug = slugify(this.title, {
    remove: /[$*_+~.()'"!\-:@]/g,
    lower: true
  });
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i')
  const articlesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (articlesWithSlug.length) {
    this.slug = `${this.slug}-${articlesWithSlug.length + 1}`
  }
  next();
});


articleSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Article", articleSchema);
