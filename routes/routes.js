const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { catchErrors } = require("../helpers/errorHandlers");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: "200MB",
    files: 2
  }
});

// NOTE: Use catchErrors() to wrap any async controller methods
// This will safely pass any errors on to a middleware handler

router.get("/",
  catchErrors(pageController.homepage)
);
router.get("/videos",
  catchErrors(pageController.videos)
);
router.get("/videos/:category",
  catchErrors(pageController.videos)
);
router.get("/videos/id/:id",
  catchErrors(pageController.videoArticle)
);
router.get("/news",
  catchErrors(pageController.news)
);
router.get("/news/:slug",
  catchErrors(pageController.newsArticle)
);
router.get("/mixtapes",
  catchErrors(pageController.mixtapes)
);
router.get("/mixtapes/:artist", (req, res) => {
  res.redirect('/mixtapes')
});
router.get("/mixtapes/:artist/:title",
  catchErrors(pageController.mixtapeArticle)
);
router.get("/video-production",
  pageController.videoProduction
);
router.post("/video-production",
  catchErrors(pageController.videoProductionForm)
);
router.get("/about",
  pageController.about
);
router.get("/album",
  pageController.album
);


// Authentication
router.get("/logout", authController.logout);
router.get("/login",
  authController.isLoggedInFlash,
  pageController.login
);
router.post("/login", authController.login);
router.get("/create-user", pageController.createUser);
router.post("/create-user",
  authController.validateRegister,
  authController.createUser,
  authController.login
);


// Admin
router.all(/admin/,
  authController.isLoggedIn
);
router.get("/admin/", (req, res) => {
  res.redirect("/admin/videos")
});

router.get("/admin/videos",
  catchErrors(adminController.videos)
);
router.get("/admin/videos/new",
  catchErrors(adminController.newVideoPage)
);
router.post("/admin/videos/new/:id",
  catchErrors(adminController.newVideo)
);
router.get("/admin/videos/edit/:id",
  catchErrors(adminController.editVideoPage)
);
router.post("/admin/videos/edit/:id",
  catchErrors(adminController.editVideo)
);
router.get("/admin/videos/scrape",
  catchErrors(adminController.scrapeLatestVideos)
);
router.get("/admin/videos/delete/:id",
  catchErrors(adminController.deleteVideo)
);

router.get("/admin/news",
  catchErrors(adminController.news)
);
router.get("/admin/news/new",
  catchErrors(adminController.editArticlePage)
);
router.post("/admin/news/new",
  upload.single("image"),
  catchErrors(adminController.newArticle)
);
router.get("/admin/news/edit/:slug",
  catchErrors(adminController.editArticlePage)
);
router.post("/admin/news/edit/:slug",
  upload.single("image"),
  catchErrors(adminController.editArticle)
);
router.get("/admin/news/delete/:slug",
  catchErrors(adminController.deleteArticle)
);

router.get("/admin/mixtapes",
  catchErrors(adminController.mixtapes)
);
router.get("/admin/mixtapes/new",
  catchErrors(adminController.editMixtapePage)
);
router.get("/admin/mixtapes/edit/:id",
  catchErrors(adminController.editMixtapePage)
);
router.post("/admin/mixtapes/new",
  upload.fields([
    { name: "artwork" },
    { name: "zip" }
  ]),
  catchErrors(adminController.newMixtape)
);
router.post("/admin/mixtapes/edit/:id",
  catchErrors(adminController.editMixtape)
);

// Admin API
router.post("/admin/api/videos/:id",
  catchErrors(adminController.searchById)
);

module.exports = router;