const mongoose = require("mongoose");
const User = mongoose.model("User");
const Video = mongoose.model("Video");
const youtube = require("../youtube/client");
const { setFeaturedVideo } = require("../helpers/featuredVideo");

exports.videos = async (req, res) => {
  const filter = {}
  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: "i" };
  }
  const videos = await Video.find(filter).sort({ _id: -1 })
  res.render("admin/videos", {
    title: "Admin Dashboard | Videos",
    description: "P110 Admin Dashboard",
    videos
  });
};

exports.newVideoPage = async (req, res) => {
  res.render("admin/videoEdit", {
    title: "Admin Dashboard | New Video",
    description: "P110 Admin Dashboard"
  });
};

exports.newVideo = async (req, res) => {
  const videoSave = await new Video(req.body).save(err => {
    if (err) {
      req.flash("error", "Video already exists");
      res.status(400);
      res.send()
    } else {
      req.flash("success", "Successfully added video");
      res.status(200);
      res.send();
      if (req.body.featured) {
        setFeaturedVideo(req.body.youtubeId)
      }
    }
  });
};

exports.editVideoPage = async (req, res) => {
  const video = await Video.findOne({
    youtubeId: req.params.id
  })
  res.render("admin/videoEdit", {
    title: "Admin Dashboard | Edit Video",
    description: "P110 Admin Dashboard",
    video
  });
};

exports.editVideo = async (req, res) => {
  const videoSave = await Video.findOneAndUpdate(
    { youtubeId: req.body.youtubeId },
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      }
    },
    { new: true },
    (err, item) => {
      if (err || !item) {
        req.flash("error", "Error updating video");
        res.status(400);
        res.send()
        return;
      }
      item.save().then(saved => {
        req.flash("success", "Successfully updated video");
        res.status(200);
        res.send()
        if (req.body.featured) {
          setFeaturedVideo(item._id)
        }
      });
    }
  );
};

exports.deleteVideo = async (req, res) => {
  const deleted = await Video.remove({ youtubeId: req.params.id }, err => {
    if (err) {
      req.flash("error", "Error deleting vehicle");
    } else {
      req.flash("success", "Successfully deleted vehicle");
    }
    res.redirect("/admin/videos");
  });
};

exports.searchById = async (req, res) => {
  youtube.searchById(req.params.id)
    .then(data => {
      res.json(data)
    })
    .catch(err => {
      console.log(err)
      res.status(400)
      res.json({ err })
    })
};

exports.news = async (req, res) => {
  res.render("admin/news", {
    title: "Admin Dashboard | Videos",
    description: "P110 Admin Dashboard"
  });
};

exports.artists = async (req, res) => {
  res.render("admin/artists", {
    title: "Admin Dashboard | Videos",
    description: "P110 Admin Dashboard"
  });
};
