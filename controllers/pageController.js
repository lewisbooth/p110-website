const mongoose = require("mongoose")
const { contactForm } = require("../helpers/contactForm")
const User = mongoose.model("User")
const Video = mongoose.model("Video")
const Article = mongoose.model("Article")
const Channel = mongoose.model("Channel")
const Mixtape = mongoose.model("Mixtape")
const Settings = mongoose.model("Settings")

exports.homepage = async (req, res) => {
  // Promise.all starts queries in parallel
  // Only use when queries are not dependent on each other
  const [videos, mixtapes, articles, featuredVideo] = await Promise.all([
    Video.getLatestVideos(),
    Mixtape.getLatestMixtapes(),
    Article.getLatestArticles(),
    Settings.getFeaturedVideo()
  ])
  res.render("index", {
    videos,
    articles,
    mixtapes,
    featuredVideo,
    openGraphImage: featuredVideo ? `https://i.ytimg.com/vi/${featuredVideo.youtubeId}/maxresdefault.jpg` : "",
    title: "Grime, Rap & Freestyle Music Videos - The Home Of UK Urban Entertainment",
    description:
      "Watch the hottest UK grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more. Get your videos produced on the P110 platform today."
  })
}

exports.search = async (req, res) => {
  if (!req.query.navsearch) {
    return res.redirect("/")
  }
  const search = req.query.navsearch
  const [videos, mixtapes, articles] = await Promise.all([
    Video.getLatestVideos({ search, limit: 0 }),
    Mixtape.getLatestMixtapes({ search }),
    Article.getLatestArticles({ search })
  ])
  console.log(videos)
  res.render("search", {
    videos,
    articles,
    mixtapes,
    title: "Search results for " + req.params.search
  })
}

exports.videos = async (req, res) => {
  const filter = {}
  if (req.params.category)
    filter.category = req.params.category

  const videos = await Video.getLatestVideos({
    limit: 20,
    search: req.query.search || null,
    filter
  })
  res.render("latest-videos", {
    videos,
    title: "Latest Videos",
    description:
      "View our latest UK grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  })
}


exports.videoArticle = async (req, res) => {
  [video, latestVideos] = await Promise.all([
    Video.findOne({ youtubeId: req.params.id }),
    Video.getLatestVideos({
      limit: 4,
      exclude: req.params.id
    })
  ])
  if (!video) {
    req.flash('error', 'Video not found')
    res.redirect('/videos')
    return
  }
  res.render("video-article", {
    video,
    latestVideos,
    openGraphImage: `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`,
    title: video.title,
    description: video.description
  })
}

exports.news = async (req, res) => {
  const articles = await Article.getLatestArticles({
    search: req.query.search || null,
    limit: 20
  })
  res.render("latest-news", {
    articles,
    title: "Latest Grime & Rap News Articles",
    description:
      "Get the latest news & trends from the UK grime & rap scene."
  })
}

exports.newsArticle = async (req, res) => {
  [article, latestArticles] = await Promise.all([
    Article.findOne({
      slug: req.params.slug
    }),
    Article.getLatestArticles({
      limit: 4,
      exclude: req.params.slug
    })
  ])
  if (!article) {
    req.flash("error", "Article not found")
    res.redirect("back")
    return
  }
  const openGraphImage =
    article.cover.type === "youtube" ?
      `https://i.ytimg.com/vi/${article.cover.youtubeId}/maxresdefault.jpg` :
      `/images/articles/${article._id}/large.jpg`
  res.render("news-article", {
    article,
    latestArticles,
    openGraphImage,
    title: article.title,
    description: article.text
  })

}

exports.mixtapes = async (req, res) => {
  const mixtapes = await Mixtape.getLatestMixtapes({
    search: req.query.search || null,
    limit: 30
  })
  res.render("mixtapes", {
    mixtapes,
    title: "Latest Mixtapes from the UK Grime & Rap Scene",
    description:
      "Explore the Hottest Mixtapes, EPs, Albums & Singles from the Urban UK Grime & Rap scene."
  })
}

exports.mixtapeArticle = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    req.flash("error", "Mixtape not found")
    res.redirect("back")
    return
  }
  [mixtape, latestMixtapes] = await Promise.all([
    Mixtape.findOne({ _id: req.params.id }),
    Mixtape.getLatestMixtapes({
      limit: 4,
      exclude: req.params.id
    })
  ])
  if (!mixtape) {
    req.flash("error", "Mixtape not found")
    res.redirect("back")
    return
  }
  const openGraphImage = `/images/mixtapes/${mixtape._id}/large.jpg`
  res.render("mixtape-article", {
    mixtape,
    latestMixtapes,
    openGraphImage,
    title: mixtape.fullTitle,
    description: mixtape.description
  })
}

exports.videoProduction = (req, res) => {
  res.render("video-production", {
    title: "Video Production -  Get Featured On P110 Media Today",
    description:
      "Get your own P110 music video produced by our team of experienced videographers and be promoted through our platform along with Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  })
}

exports.album = (req, res) => {
  res.render("album", {
    title: "The Album - Featuring Mist, Fredo, Jaykae, Astar, Ard Ardz, Tempa, Stardom & Splinta",
    description:
      "P110 The Album is Out Now! Featuring Mist, Fredo, Jaykae, Astar, Ard Ardz, Tempa, Stardom & Splinta. Stream Now Via Spotify, Apple Music & Google Play."
  })
}

exports.videoProductionForm = async (req, res, next) => {
  const name = String(req.body.name)
  const email = String(req.body.email)
  const message = String(req.body.message)
  const bot = String(req.body.bot)

  // Invisible <input> field to capture some bots
  if (bot.length > 0) {
    console.log('🤖  Bot detected')
    req.flash("error", "Error sending message, please try again later")
    res.status(400).send()
    return
  }

  await contactForm({
    messageData: { name, email, message }
  }).then(() => {
    req.flash("success", "Thank you for contacting P110, we'll be in touch soon.")
    res.redirect('/video-production')
  }).catch(err => {
    req.flash("error", "Error sending message, please try again later")
    res.redirect('/video-production')
  })
}

exports.about = (req, res) => {
  res.render("about", {
    title: "About Us -  The Home of Urban Entertainment",
    description:
      "P110 is a broadcasting platform working with new and current talent. We offer a range of platforms within the channel, including freestyles, live performances, documentaries & high quality music videos."
  })
}

exports.login = async (req, res) => {
  res.render("login", {
    title: "Log In",
    description:
      "Log In"
  })
}

// Used for safely creating user accounts
// Obviously not connected
exports.createUser = async (req, res) => {
  res.render("create-user", {
    title: "Create User",
    description:
      "Create a user with no validation"
  })
}