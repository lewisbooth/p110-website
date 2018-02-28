const mongoose = require("mongoose");
const User = mongoose.model("User");

// Titles and descriptions are written here
// Titles are appended with "| AMP" in views/templates/head.pug

exports.homepage = async (req, res) => {
  res.render("index", {
    title: "Express MVC Boilerplate",
    description:
      "Index page description"
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
