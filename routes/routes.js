const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
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

router.get("/", catchErrors(pageController.homepage));

module.exports = router;