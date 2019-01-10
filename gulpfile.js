var gulp = require("gulp")
var plumber = require('gulp-plumber')
var stylus = require("gulp-stylus")
var postcss = require("gulp-postcss")
var autoprefixer = require("autoprefixer")
var cssnano = require("cssnano")
var babel = require("gulp-babel")
var minify = require("gulp-minify")
var browserSync = require("browser-sync").create()
require("dotenv").config({ path: "variables.env" })

gulp.task("default", ["serve"])

gulp.task("serve", ["stylus", "scripts"], () => {
  browserSync.init({
    proxy: `localhost:${process.env.PORT || 8888}`
  })
  gulp.watch("styles/**/*.styl", ["stylus"])
  gulp.watch("scripts/**/*.js", ["watch-scripts"])
  gulp.watch("views/**/*.pug").on("change", browserSync.reload)
})

gulp.task("scripts", () => {
  return gulp
    .src("scripts/**/*.js")
    .pipe(plumber())
    .pipe(
      babel({
        presets: ["env"]
      })
    )
    .pipe(minify({
      noSource: true,
      ext: { min: ".js" }
    }))
    .pipe(gulp.dest("public/js"))
})

gulp.task("watch-scripts", ["scripts"], () => {
  browserSync.reload()
})

gulp.task("stylus", () => {
  var plugins = [
    autoprefixer({ browsers: ["last 3 versions"] }),
    cssnano({ discardUnused: false })
  ]
  return gulp
    .src("styles/*.styl")
    .pipe(stylus())
    .pipe(postcss(plugins))
    .pipe(gulp.dest("public/css"))
    .pipe(browserSync.stream())
})

