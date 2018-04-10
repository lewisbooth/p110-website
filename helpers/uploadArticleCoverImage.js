const fs = require("fs")
const sharp = require("sharp")
const mkdirp = require("mkdirp")

exports.uploadArticleCoverImage = (photo, articleId) => {
  return new Promise((resolve, reject) => {
    const photoFolder = `${process.env.ROOT}/public/images/articles/${articleId}`;
    if (!fs.existsSync(photoFolder)) {
      mkdirp.sync(photoFolder)
    }
    sharp(photo)
      .rotate()
      // Resize to 1000px on longest side
      .resize(1000, 1000)
      .max()
      .toFormat("jpg")
      .toFile(`${photoFolder}/large.jpg`)
      .then(() => {
        sharp(photo)
          .rotate()
          // Resize to 400px on longest side
          .resize(400, 400)
          .max()
          .toFormat("jpg")
          .toFile(
            `${photoFolder}/thumbnail.jpg`
          )
          .then(() => {
            resolve()
          });
      })
      .catch(err => {
        console.error(err);
        reject("Error uploading the photo. Please try again.");
      });
  })
}
