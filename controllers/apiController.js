const mongoose = require("mongoose")
const path = require("path")
const Video = mongoose.model("Video")
const Article = mongoose.model("Article")
const Mixtape = mongoose.model("Mixtape")
const Channel = mongoose.model("Channel")

const errorFlash = (res, errors) => {
  const errorData = {}
  errors.forEach((error, i) => {
    errorData[i] = error
  })
  res.status(400).json({ "errors": errorData })
}

const generateListParams = (req, maxLimit = 50, defaultLimit = 20) => {
  let errors = []
  let limit = parseInt(req.query.limit) || defaultLimit
  if (limit > maxLimit)
    errors.push(`Max limit of ${maxLimit} articles`)
  const skip = parseInt(req.query.page) * limit - limit || 0
  const filter = {}
  if (req.params.category && req.path.includes("videos"))
    filter.category = req.params.category
  const params = {
    skip,
    filter,
    limit,
    search: req.query.search || null,
  }
  return ({ params, errors })
}

exports.docs = (req, res) => {
  res.render('api-docs', {
    title: "API v1 Documentation"
  })
}

exports.listVideos = async (req, res) => {
  const { params, errors } = generateListParams(req)
  const videos = await Video.getLatestVideos(params)
  if (!videos || !videos.length)
    errors.push("No videos found")
  if (errors.length > 0)
    errorFlash(res, errors)
  else
    res.json({ videos })
}

exports.videoData = async (req, res) => {
  video = await Video.findOne({
    youtubeId: req.params.id
  })
  if (!video)
    return errorFlash(res, [`Video not found: ${req.params.id}`])
  res.json(video)
}

exports.listArticles = async (req, res) => {
  const { params, errors } = generateListParams(req)
  const articles = await Article.getLatestArticles(params)
  if (!articles || !articles.length)
    errors.push("No articles found")
  if (errors.length > 0)
    errorFlash(res, errors)
  else
    res.json({ articles })
}

exports.articleData = async (req, res) => {
  article = await Article.findOne({
    slug: req.params.slug,
    published: true
  })
  if (!article)
    return errorFlash(res, [`Article not found: ${req.params.slug}`])
  res.json(article)
}

exports.listMixtapes = async (req, res) => {
  const { params, errors } = generateListParams(req)
  const mixtapes = await Mixtape.getLatestMixtapes(params)
  if (!mixtapes || !mixtapes.length)
    errors.push("No mixtapes found")
  if (errors.length > 0)
    errorFlash(res, errors)
  else
    res.json({ mixtapes })
}

exports.mixtapeData = async (req, res) => {
  mixtape = await Mixtape.findOne({
    _id: req.params.id
  })
  if (!mixtape)
    return errorFlash(res, [`Mixtape not found: ${req.params.id}`])
  res.json(mixtape)
}

exports.channelStats = async (req, res) => {
  const stats = await Channel.getStats()
  if (!stats)
    return res
      .status(400)
      .json({ "error": "Error retrieving stats" })
  res.json(stats)
}