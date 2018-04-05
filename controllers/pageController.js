const mongoose = require("mongoose");
const { contactForm } = require("../helpers/contactForm");
const User = mongoose.model("User");
const Video = mongoose.model("Video");
const Channel = mongoose.model("Channel");
const Settings = mongoose.model("Settings");

exports.homepage = async (req, res) => {
  // Promise.all starts queries in parallel
  // Only use when queries are not dependent on each other
  [videos, featuredVideo] = await Promise.all([
    Video.getLatestVideos(),
    Settings.getFeaturedVideo()
  ])
  res.render("index", {
    videos,
    featuredVideo,
    title: "Grime, Rap & Freestyle Music Videos - The Home Of Urban Entertainment",
    description:
      "Watch the hottest grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more. Get your videos produced on the P110 platform today."
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
      "View our latest grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
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
  res.render("latest-news", {
    title: "Latest Grime & Rap News Articles",
    description:
      "Get the latest news & trends from the UK grime & rap scene."
  });
};

exports.newsArticle = async (req, res) => {
  res.render("news-article", {
    title: "LD On UK Drill scene, 67 Being Back &amp; More",
    description:
      "Get the latest news & trends from the UK grime & rap scene."
  });
};

exports.artists = async (req, res) => {
  res.render("artists", {
    title: "Our Artists",
    description:
      "View the artists on the P110 Media platform, from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  });
};

exports.artistPage = async (req, res) => {
  res.render("artist-page", {
    title: "Jaykae – Artist Profile",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."
  });
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