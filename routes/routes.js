const express = require("express")
const router = express.Router()
const pageController = require("../controllers/pageController")
const apiController = require("../controllers/apiController")
const authController = require("../controllers/authController")
const adminController = require("../controllers/adminController")
const infiniteScrollController =
  require("../controllers/infiniteScrollController")
const { catchErrors } = require("../helpers/errorHandlers")
const multer = require("multer")
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: "200MB"
  }
})

router.get("*", (req, res, next) => {
  if (req.query.navsearch && req.path !== "/search")
    res.redirect(`/search?navsearch=${req.query.navsearch}`)
  else
    next()
})

router.get("/",
  catchErrors(pageController.homepage)
)
router.get("/search",
  catchErrors(pageController.search)
)
router.get("/videos",
  catchErrors(pageController.videos)
)
router.post("/videos",
  catchErrors(infiniteScrollController.videos)
)
router.get("/videos/:category",
  catchErrors(pageController.videos)
)
router.post("/videos/:category",
  catchErrors(infiniteScrollController.videos)
)
router.get("/videos/id/:id",
  catchErrors(pageController.videoArticle)
)
router.get("/news",
  catchErrors(pageController.news)
)
router.post("/news",
  catchErrors(infiniteScrollController.news)
)
router.get("/news/:slug",
  catchErrors(pageController.newsArticle)
)
router.get("/mixtapes",
  catchErrors(pageController.mixtapes)
)
router.post("/mixtapes",
  catchErrors(infiniteScrollController.mixtapes)
)
router.get("/mixtapes/:id",
  catchErrors(pageController.mixtapeArticle)
)
router.post("/mixtapes/:id",
  catchErrors(infiniteScrollController.mixtapes)
)
router.get("/video-production",
  pageController.videoProduction
)
router.post("/video-production",
  catchErrors(pageController.videoProductionForm)
)
router.get("/about",
  pageController.about
)
router.get("/album",
  pageController.album
)

// API
router.get("/api/v1/docs",
  apiController.docs
)
router.get("/api/v1/videos/id/:id",
  catchErrors(apiController.videoData)
)
router.get("/api/v1/videos/list",
  catchErrors(apiController.listVideos)
)
router.get("/api/v1/news/article/:slug",
  catchErrors(apiController.articleData)
)
router.get("/api/v1/news/list",
  catchErrors(apiController.listArticles)
)
router.get("/api/v1/mixtapes/id/:id",
  catchErrors(apiController.mixtapeData)
)
router.get("/api/v1/mixtapes/list",
  catchErrors(apiController.listMixtapes)
)
router.get("/api/v1/stats",
  catchErrors(apiController.channelStats)
)

// Authentication
router.get("/logout", authController.logout)
router.get("/login",
  authController.isLoggedInFlash,
  pageController.login
)
router.post("/login", authController.login)

// Admin
router.all(/admin/,
  authController.isLoggedIn
)
router.get("/admin/", (req, res) => {
  res.redirect("/admin/videos")
})

router.get("/admin/videos",
  catchErrors(adminController.videos)
)
router.post("/admin/videos",
  catchErrors(infiniteScrollController.videos)
)
router.get("/admin/videos/new",
  catchErrors(adminController.newVideoPage)
)
router.post("/admin/videos/new/:id",
  catchErrors(adminController.newVideo)
)
router.get("/admin/videos/edit/:id",
  catchErrors(adminController.editVideoPage)
)
router.post("/admin/videos/edit/:id",
  catchErrors(adminController.editVideo)
)
router.get("/admin/videos/scrape",
  catchErrors(adminController.scrapeLatestVideos)
)
router.get("/admin/videos/delete/:id",
  catchErrors(adminController.deleteVideo)
)

router.get("/admin/news",
  catchErrors(adminController.news)
)
router.post("/admin/news",
  catchErrors(infiniteScrollController.news)
)
router.get("/admin/news/new",
  catchErrors(adminController.editArticlePage)
)
router.post("/admin/news/new",
  upload.single("image"),
  catchErrors(adminController.newArticle)
)
router.get("/admin/news/edit/:slug",
  catchErrors(adminController.editArticlePage)
)
router.post("/admin/news/edit/:slug",
  upload.single("image"),
  catchErrors(adminController.editArticle)
)
router.get("/admin/news/delete/:slug",
  catchErrors(adminController.deleteArticle)
)

router.get("/admin/mixtapes",
  catchErrors(adminController.mixtapes)
)
router.post("/admin/mixtapes",
  catchErrors(infiniteScrollController.mixtapes)
)
router.get("/admin/mixtapes/new",
  catchErrors(adminController.editMixtapePage)
)
router.get("/admin/mixtapes/edit/:id",
  catchErrors(adminController.editMixtapePage)
)
router.post("/admin/mixtapes/new",
  upload.fields([
    { name: "artwork" },
    { name: "zip" }
  ]),
  catchErrors(adminController.newMixtape)
)
router.post("/admin/mixtapes/edit/:id",
  upload.fields([
    { name: "artwork" },
    { name: "zip" }
  ]),
  catchErrors(adminController.editMixtape)
)
router.get("/admin/mixtapes/delete/:id",
  catchErrors(adminController.deleteMixtape)
)


// Admin API
router.post("/admin/api/videos/:id",
  catchErrors(adminController.searchById)
)

module.exports = router