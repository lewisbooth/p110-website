const fs = require("fs")
const sharp = require("sharp")
const mkdirp = require("mkdirp")

exports.uploadMixtapeCoverImage = (photo, id) => {
  return new Promise((resolve, reject) => {
    const photoFolder = `${process.env.ROOT}/public/images/mixtapes/${id}`;
    if (!fs.existsSync(photoFolder)) {
      mkdirp.sync(photoFolder)
    }
    sharp(photo)
      .rotate()
      // Resize to 600px square
      .resize(600, 600)
      .toFormat("jpg")
      .toFile(`${photoFolder}/large.jpg`)
      .then(() => {
        sharp(photo)
          .rotate()
          // Resize to 200px square
          .resize(200, 200)
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
