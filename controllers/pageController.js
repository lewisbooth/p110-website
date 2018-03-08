const mongoose = require("mongoose");
const User = mongoose.model("User");

// Titles and descriptions are written in the controllers
// Titles are appended with "| AMP" in views/templates/head.pug

exports.homepage = async (req, res) => {
  res.render("index", {
    title: "Grime, Rap & Freestyle Music Videos - The Home Of Urban Entertainment",
    description:
      "Watch the hottest grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more. Get your videos produced on the P110 platform today."
  });
};

exports.videos = async (req, res) => {
  res.render("latest-videos", {
    title: "Latest Videos",
    description:
      "View our latest grime & rap freestyles, live performances, documentaries & high quality music videos from Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  });
};

exports.videoArticle = async (req, res) => {
  res.render("video-article", {
    title: "Video Title",
    description:
      "Video Description"
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

exports.videoProduction = async (req, res) => {
  res.render("video-production", {
    title: "Video Production -  Get Featured On P110 Media Today",
    description:
      "Get your own P110 music video produced by our team of experienced videographers and be promoted through our platform along with Skepta, Mist, Giggs, Bugzy Malone, Section Boyz, Potter Payper, Jaykae and more."
  });
};




exports.login = async (req, res) => {
  res.render("login", {
    title: "Log In",
    description:
      "Log In"
  });
};

exports.createUser = async (req, res) => {
  res.render("create-user", {
    title: "Create User",
    description:
      "Create a user with no validation"
  });
};




// Reference controller for creating queries
exports.sampleQuery = async (req, res) => {
  const users = await User.find({})
    .limit(3)
    .sort({ updatedAt: -1 });
  res.render("queryResults", {
    users,
    title: "Last 3 users",
    description:
      "A list of the 3 most recently updated users"
  });
};
