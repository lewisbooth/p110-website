const mongoose = require("mongoose");
const { contactForm } = require("../helpers/contactForm");
const User = mongoose.model("User");
const Video = mongoose.model("Video");
const Article = mongoose.model("Article");
const Channel = mongoose.model("Channel");
const Settings = mongoose.model("Settings");

exports.homepage = async (req, res) => {
  // Promise.all starts queries in parallel
  // Only use when queries are not dependent on each other
  [videos, articles, featuredVideo] = await Promise.all([
    Video.getLatestVideos(),
    Article.getLatestArticles(),
    Settings.getFeaturedVideo()
  ])
  res.render("index", {
    videos,
    articles,
    featuredVideo,
    openGraphImage: featuredVideo ? `https://i.ytimg.com/vi/${featuredVideo.youtubeId}/maxresdefault.jpg` : "",
    title: "Grime, Rap & Freestyle Music Videos - The Home Of UK Urban Entertainment",
    description:
      "Watch the hottest UK grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more. Get your videos produced on the P110 platform today."
  });
};

exports.videos = async (req, res) => {
  const filter = {}
  if (req.params.category) {
    filter.category = req.params.category
  }
  const videos = await Video.getLatestVideos({ filter, limit: 0 })
  res.render("latest-videos", {
    videos,
    title: "Latest Videos",
    description:
      "View our latest UK grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  });
};

exports.videoArticle = async (req, res) => {
  const video = await Video.findOne({ youtubeId: req.params.id })
  if (!video) {
    req.flash('error', 'Video not found')
    res.redirect('/videos')
    return
  }
  const latestVideos = await Video
    .find()
    .sort({ published: -1 })
    .limit(4)
  res.render("video-article", {
    video,
    latestVideos,
    title: video.title,
    description: video.description
  });
};

exports.news = async (req, res) => {
  const articles = await Article.getLatestArticles()
  res.render("latest-news", {
    articles,
    title: "Latest Grime & Rap News Articles",
    description:
      "Get the latest news & trends from the UK grime & rap scene."
  });
};

exports.newsArticle = async (req, res) => {
  [article, latestArticles] = await Promise.all([
    Article.findOne({ slug: req.params.slug }),
    Article.getLatestArticles({
      limit: 4,
      exclude: req.params.slug
    })
  ])
  if (!article) {
    req.flash("error", "Article not found")
    res.redirect("back")
  } else {
    res.render("news-article", {
      article,
      latestArticles,
      title: article.title,
      description: article.text
    });
  }
};

exports.videoProduction = (req, res) => {
  res.render("video-production", {
    title: "Video Production -  Get Featured On P110 Media Today",
    description:
      "Get your own P110 music video produced by our team of experienced videographers and be promoted through our platform along with Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  });
};

exports.album = (req, res) => {
  res.render("album", {
    title: "The Album - Featuring Mist, Fredo, Jaykae, Astar, Ard Ardz, Tempa, Stardom & Splinta",
    description:
      "Get your own P110 music video produced by our team of experienced videographers and be promoted through our platform along with Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  });
};

exports.videoProductionForm = async (req, res, next) => {
  const name = String(req.body.name)
  const email = String(req.body.email)
  const message = String(req.body.message)
  const bot = String(req.body.bot)

  // Invisible <input> field to capture some bots
  if (bot.length > 0) {
    console.log('🤖  Bot detected');
    req.flash("error", "Error sending message, please try again later")
    res.status(400).send();
    return
  }

  await contactForm({ messageData: { name, email, message } }).then(err => {
    if (err) {
      req.flash("error", "Error sending message, please try again later")
    } else {
      req.flash("success", "Thank you for contacting P110, we'll be in touch soon.")
    }
    // Always use res.redirect() on POST controllers, otherwise req.flash() does not work. Flashes are only shown on subsequent requests.
    res.redirect('/video-production')
  })
};

exports.about = (req, res) => {
  res.render("about", {
    title: "About Us -  The Home of Urban Entertainment",
    description:
      "P110 is a broadcasting platform working with new and current talent. We offer a range of platforms within the channel, including freestyles, live performances, documentaries & high quality music videos."
  });
};

exports.login = async (req, res) => {
  res.render("login", {
    title: "Log In",
    description:
      "Log In"
  });
};

// Used for safely creating user accounts
// Obviously not connected in production
exports.createUser = async (req, res) => {
  res.render("create-user", {
    title: "Create User",
    description:
      "Create a user with no validation"
  });
};