const mongoose = require("mongoose");
const pug = require("pug");
const path = require("path");
const Video = mongoose.model("Video");
const Article = mongoose.model("Article");
const Mixtape = mongoose.model("Mixtape");

// Renders DB documents into a given template and returns the HTML
const renderHTML = (docs, template, options, name) => {
  let html = ""
  docs.forEach(doc => {
    options[name] = doc
    pug.renderFile(template, options, (err, file) => {
      if (err)
        console.log(err)
      else
        html += file
    })
  })
  return html
}

exports.videos = async (req, res) => {
  const filter = {}
  if (req.params.category)
    filter.category = req.params.category
  const skip = parseInt(req.body.from) || 0
  const videos = await Video.getLatestVideos({
    skip,
    filter,
    limit: 20,
    search: req.query.search || null,
  })
  const template = path.join(
    __dirname,
    '../views/mixins/videoListingRaw.pug'
  )
  res.locals.admin = req.path.includes("admin")
  const html = renderHTML(videos, template, res.locals, "video")
  res.json({ html })
};

exports.mixtapes = async (req, res) => {
  const filter = {}
  if (req.params.category)
    filter.category = req.params.category
  const skip = parseInt(req.body.from) || 0
  const mixtapes = await Mixtape.getLatestMixtapes({
    skip,
    filter,
    limit: 30,
    search: req.query.search || null,
  })
  const template = path.join(
    __dirname,
    '../views/mixins/mixtapeListingRaw.pug'
  )
  const html = renderHTML(mixtapes, template, res.locals, "mixtape")
  res.json({ html })
};

exports.news = async (req, res) => {
  const filter = {}
  if (req.params.category)
    filter.category = req.params.category
  const skip = parseInt(req.body.from) || 0
  const news = await Article.getLatestArticles({
    skip,
    filter,
    limit: 20,
    search: req.query.search || null,
  })
  const template = path.join(
    __dirname,
    '../views/mixins/articleListingRaw.pug'
  )
  const html = renderHTML(news, template, res.locals, "article")
  res.json({ html })
};