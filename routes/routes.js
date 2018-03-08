const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const authController = require("../controllers/authController");
const { catchErrors } = require("../helpers/errorHandlers");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: "20MB",
    files: 1
  }
});

// NOTE: Use catchErrors() to wrap any async controller methods, e.g. Mongo queries

router.get("/",
  catchErrors(pageController.homepage)
);
router.get("/videos",
  catchErrors(pageController.videos)
);
router.get("/videos/:category",
  catchErrors(pageController.videos)
);
router.get("/videos/id/:youtubeId",
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
router.get("/video-production",
  pageController.videoProduction
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

module.exports = router;