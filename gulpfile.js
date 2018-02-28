var gulp = require("gulp");
var stylus = require("gulp-stylus");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var babel = require("gulp-babel");
var minify = require("gulp-minify");
var browserSync = require("browser-sync").create();

gulp.task("serve", ["stylus", "scripts"], function () {
  browserSync.init({
    proxy: "localhost:8888"
  });
  gulp.watch("styles/**/*.styl", ["stylus"]);
  gulp.watch("scripts/**/*.js", ["watch-scripts"]);
  gulp.watch("views/**/*.pug").on("change", browserSync.reload);
});

gulp.task("scripts", function () {
  return gulp
    .src("scripts/**/*.js")
    .pipe(
      babel({
        presets: ["env"]
      })
    )
    .pipe(minify({
      noSource: true,
      ext: {
        min: ".js"
      }
    }))
    .pipe(gulp.dest("public/js"));
});

gulp.task("watch-scripts", ["scripts"], function () {
  browserSync.reload();
});

gulp.task("stylus", function () {
  var plugins = [
    autoprefixer({ browsers: ["last 3 versions"] }),
    cssnano({ discardUnused: false })
  ];
  return gulp
    .src("styles/*.styl")
    .pipe(stylus())
    .pipe(postcss(plugins))
    .pipe(gulp.dest("public/css"))
    .pipe(browserSync.stream());
});

gulp.task("default", ["serve"]);
