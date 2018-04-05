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
    fileSize: "20MB",
    files: 1
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
router.get("/news/article", (req, res) => {
  res.redirect('/news');
});
router.get("/news/article/:articleId",
  catchErrors(pageController.newsArticle)
);
router.get("/artists",
  catchErrors(pageController.artists)
);
router.get("/artists/:artistId",
  catchErrors(pageController.artistPage)
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
  // Matches any /admin route
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
router.get("/admin/news/edit/:id",
  catchErrors(adminController.editArticlePage)
);
router.get("/admin/artists",
  catchErrors(adminController.artists)
);

// Admin API
router.post("/admin/api/videos/:id",
  catchErrors(adminController.searchById)
);

module.exports = router;