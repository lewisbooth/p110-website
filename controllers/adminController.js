const mongoose = require("mongoose");
const User = mongoose.model("User");
const Video = mongoose.model("Video");
const Article = mongoose.model("Article");
const Settings = mongoose.model("Settings");
const fs = require("fs");
const path = require("path");
const rmdir = require("rmdir");
const youtube = require("../youtube/client");
const { scrapeLatestVideos } = require("../youtube/client");
const { uploadArticleCoverImage } = require("../helpers/uploadArticleCoverImage");

exports.videos = async (req, res) => {
  const filter = {}
  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: "i" };
  }
  const videos = await Video.getLatestVideos({ filter, limit: 0 })
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
  scrapeLatestVideos().then(newVideos => {
    if (newVideos === 0) {
      req.flash("success", "No new videos found")
    } else if (newVideos === 1) {
      req.flash("success", `1 video added to database`)
    } else {
      req.flash("success", `${newVideos} videos added to database`)
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
    const deleted = await Video.findOneAndRemove({ youtubeId: req.params.id }, (err, doc) => {
      if (err || !doc) {
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
    limit: 0
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
    article: article
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
  console.log(req.body)
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
  if (deleted) {
    console.log(deleted)
    const imageFolder = path.join(process.env.ROOT, `public/images/articles/${deleted._id}`)
    if (fs.existsSync(imageFolder)) {
      rmdir(imageFolder)
    }
    req.flash("success", "Successfully deleted article");
    res.redirect("/admin/news");
  } else {
    req.flash("error", "Error deleting article");
    res.redirect("/admin/news");
  }
};

exports.artists = async (req, res) => {
  res.render("admin/artists", {
    title: "Admin Dashboard | Videos",
    description: "P110 Admin Dashboard"
  });
};

