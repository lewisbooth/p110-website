const mongoose = require("mongoose");
const User = mongoose.model("User");
const Video = mongoose.model("Video");
const Article = mongoose.model("Article");
const Mixtape = mongoose.model("Mixtape");
const Settings = mongoose.model("Settings");
const fs = require("fs");
const path = require("path");
const rmdir = require("rmdir");
const mkdirp = require("mkdirp");
const youtube = require("../youtube/client");
const { scrapeLatestVideos } = require("../youtube/client");
const { uploadArticleCoverImage } = require("../helpers/uploadArticleCoverImage");
const { uploadMixtapeFiles } = require("../helpers/uploadMixtapeFiles");

exports.videos = async (req, res) => {
  const videos = await Video.getLatestVideos({
    limit: 20,
    search: req.query.search || null
  })
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

exports.editVideoPage = async (req, res) => {
  const video = await Video.findOne({
    youtubeId: req.params.id
  })
  if (video) {
    const featuredVideo = await Settings.getFeaturedVideo()
    res.render("admin/videoEdit", {
      title: "Admin Dashboard | Edit Video",
      description: "P110 Admin Dashboard",
      featured: video.youtubeId === featuredVideo.youtubeId,
      video
    });
  } else {
    req.flash("error", "Video not found")
    res.redirect("/admin/videos")
  }
};

exports.newVideo = async (req, res) => {
  const videoSave = await new Video(req.body).save(err => {
    if (err) {
      console.log(err)
      req.flash("error", "Video already exists");
      res.status(400);
      res.send()
    } else {
      req.flash("success", "Successfully added video");
      res.status(200);
      res.send();
      if (req.body.featured) {
        Settings.setFeaturedVideo(req.body.youtubeId)
      }
    }
  });
};

exports.scrapeLatestVideos = async (req, res) => {
  scrapeLatestVideos().then(newVideoCount => {
    if (newVideoCount === 0) {
      req.flash("success", "No new videos found")
    } else if (newVideoCount === 1) {
      req.flash("success", `1 video added to database`)
    } else {
      req.flash("success", `${newVideoCount} videos added to database`)
    }
    res.redirect("/admin/videos")
  }).catch(err => {
    console.log(err)
    req.flash("error", "Error retrieving latest videos")
    res.redirect("/admin/videos")
  })
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
          Settings.setFeaturedVideo(item._id)
        }
      });
    }
  );
};

exports.deleteVideo = async (req, res) => {
  // User is blocked from deleting the currently featured video
  const featuredVideo = await Settings.getFeaturedVideo()
  if (featuredVideo.youtubeId === req.params.id) {
    req.flash("error", "Please set another Featured Video first");
    res.redirect("back");
    return
  } else {
    const deleted = await Video.findOneAndRemove({
      youtubeId: req.params.id
    }, (err, doc) => {
      if (err) {
        req.flash("error", "Error deleting video");
      } else {
        req.flash("success", "Successfully deleted video");
      }
      res.redirect("/admin/videos");
    });
  }
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
  const articles = await Article.getLatestArticles({
    search: req.query.search || null,
    showUnpublished: true,
    limit: 20
  })
  res.render("admin/news", {
    title: "Admin Dashboard | Videos",
    description: "P110 Admin Dashboard",
    articles
  });
};

exports.editArticlePage = async (req, res) => {
  let article
  if (req.params.slug) {
    article = await Article.findOne({
      slug: req.params.slug
    })
    if (!article) {
      req.flash("error", "Article not found")
      res.redirect("/admin/news")
      return
    }
  }
  res.render("admin/articleEdit", {
    title: "Admin Dashboard | Edit Article",
    description: "P110 Admin Dashboard",
    article
  });
};

exports.newArticle = async (req, res) => {
  if (req.body.coverType === "image" && !req.file) {
    res.status(400);
    res.json({ "error": "Please supply an image" })
  }
  const article = {
    title: req.body.title,
    html: req.body.html,
    text: req.body.text,
    published: req.body.published,
    cover: {
      type: req.body.coverType,
      youtubeId: req.body.coverYoutubeId,
    }
  }
  const articleSave = await new Article(article).save(
    (err, data) => {
      if (err) {
        console.log(err)
        res.status(400);
        if (err.code === 11000) {
          res.json({ "error": "An article with that name already exists" })
        } else {
          res.json({ "error": "Error creating article" })
        }
      } else {
        if (article.cover.type === "image") {
          uploadArticleCoverImage(req.file.buffer, data._id).then(() => {
            req.flash("success", "Successfully added article");
            res.status(200);
            res.send();
          }).catch(err => {
            res.status(400);
            res.json({ "error": "Error uploading image" })
            console.log(err)
          })
        } else {
          req.flash("success", "Successfully added article");
          res.status(200);
          res.send();
        }
      }
    });
};

exports.editArticle = async (req, res) => {
  const articleSave = await Article.findOneAndUpdate(
    { slug: req.params.slug },
    {
      $set: {
        title: req.body.title,
        html: req.body.html,
        text: req.body.text,
        published: req.body.published,
        cover: {
          type: req.body.coverType,
          youtubeId: req.body.coverYoutubeId
        },
      }
    },
    { new: true },
    (err, item) => {
      if (err || !item) {
        req.flash("error", "Error updating article");
        res.status(400);
        res.send()
        return;
      }
      item.save().then(saved => {
        if (req.body.coverType === "image" && req.file) {
          uploadArticleCoverImage(req.file.buffer, item._id).then(() => {
            req.flash("success", "Successfully updated article");
            res.status(200);
            res.send();
          }).catch(err => {
            res.status(400);
            res.json({ "error": "Error uploading image" })
            console.log(err)
          })
        } else {
          req.flash("success", "Successfully updated article");
          res.status(200);
          res.send()
        }
      });
    }
  );
};

exports.deleteArticle = async (req, res) => {
  const deleted = await Article.findOneAndRemove(
    { slug: req.params.slug }
  );
  if (!deleted) {
    req.flash("error", "Error deleting article");
    res.redirect("/admin/news");
    return
  }
  const imageFolder = path.join(process.env.ROOT, `public/images/articles/${deleted._id}`)
  if (fs.existsSync(imageFolder)) {
    rmdir(imageFolder)
  }
  req.flash("success", "Successfully deleted article");
  res.redirect("/admin/news");
};

exports.mixtapes = async (req, res) => {
  const mixtapes = await Mixtape.getLatestMixtapes({
    search: req.query.search || null,
    showUnpublished: true,
    limit: 30
  })
  res.render("admin/mixtapes", {
    title: "Admin Dashboard | Mixtapes",
    description: "P110 Admin Dashboard",
    mixtapes
  });
};

exports.editMixtapePage = async (req, res) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    req.flash("error", "Mixtape not found")
    res.redirect("/admin/mixtapes")
    return
  }
  let mixtape
  if (req.params.id) {
    mixtape = await Mixtape.findOne({
      _id: req.params.id
    })
    if (!mixtape) {
      req.flash("error", "Mixtape not found")
      res.redirect("/admin/mixtapes")
      return
    }
  }
  res.render("admin/mixtapeEdit", {
    title: "Admin Dashboard | Edit mixtape",
    description: "P110 Admin Dashboard",
    mixtape
  });
};

exports.newMixtape = async (req, res) => {
  const mixtape = req.body

  mixtape.trackListing = JSON.parse(mixtape.trackListing)
  mixtape.artists = mixtape.artists
    .split(",")
    .map(artist => artist.replace(/\s/g, ''))

  if (!req.files.zip || req.files.zip[0].mimetype !== "application/zip") {
    res.status(400);
    res.json({ "error": "Please upload a ZIP containing the mixtape files" })
    return
  }
  if (req.files.artwork)
    mixtape.coverAvailable = true

  const mixtapeSave = await new Mixtape(mixtape).save(
    (err, item) => {
      if (err) {
        console.log(err)
        res.status(400);
        res.json({ "error": "Error saving to database, please try again" })
      } else {
        uploadMixtapeFiles(req, item)
          .then(() => {
            req.flash("success", "Successfully added mixtape");
            res.status(200);
            res.send();
          }).catch(err => {
            console.log(err)
            res.status(400);
            res.json({ "error": "Error uploading files, please try again" })
          })
      }
    });
};

exports.editMixtape = async (req, res) => {
  const mixtape = req.body

  mixtape.trackListing = JSON.parse(mixtape.trackListing)
  mixtape.artists = mixtape.artists
    .split(",")
    .map(artist => artist.replace(/\s/g, ''))

  if (req.files.artwork)
    mixtape.coverAvailable = true

  const mixtapeSave = await Mixtape.findOneAndUpdate(
    { _id: req.params.id },
    { $set: mixtape },
    { new: true },
    (err, item) => {
      if (err) {
        console.log(err)
        res.status(400);
        res.json({ "error": "Error saving to database, please try again" })
      } else {
        item.save()
        uploadMixtapeFiles(req, item)
          .then(() => {
            req.flash("success", "Successfully added mixtape");
            res.status(200);
            res.send();
          }).catch(err => {
            console.log(err)
            res.status(400);
            res.json({ "error": "Error uploading files, please try again" })
          })
      }
    });
};

exports.deleteMixtape = async (req, res) => {
  const deleted = await Mixtape.findOneAndRemove(
    { _id: req.params.id }
  );
  if (deleted) {
    const imageFolder = path.join(process.env.ROOT, `public/images/mixtapes/${deleted._id}`)
    const mixtapeFolder = path.join(process.env.ROOT, `public/mixtapes/${deleted._id}`)
    rmdir(imageFolder)
    rmdir(mixtapeFolder)
    console.log("Successfully removed mixtape: " + deleted.fullTitle)
    req.flash("success", "Successfully deleted mixtape");
    res.redirect("/admin/mixtapes");
  } else {
    req.flash("error", "Error deleting mixtape");
    res.redirect("/admin/mixtapes");
  }
};