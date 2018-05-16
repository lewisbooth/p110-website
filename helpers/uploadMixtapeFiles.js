const fs = require("fs")
const sharp = require("sharp")
const mkdirp = require("mkdirp")
const writeFile = require("write");

exports.uploadMixtapeFiles = (req, item) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      uploadMixtapeCoverImage(req, item),
      uploadMixtapeZip(req, item)
    ]).then(resolve())
      .catch(err => {
        reject(err)
      })
  })
}

uploadMixtapeZip = (req, item) => {
  // Save the uploaded ZIP buffer to file
  // Name format: "Artist(s) - Title"
  return new Promise((resolve, reject) => {
    if (!req.files.zip) resolve()
    const fileName = `${item.fullTitle}.zip`
    const saveFolder = `${process.env.ROOT}/public/mixtapes/${item._id}/`
    const saveLocation = saveFolder + fileName
    writeFile(saveLocation, req.files.zip[0].buffer, err => {
      if (err) reject(err)
      else resolve()
    })
  })
}

uploadMixtapeCoverImage = (req, item) => {
  return new Promise((resolve, reject) => {
    if (!req || !item || !req.files.artwork)
      resolve()
    const artworkFolder = `${process.env.ROOT}/public/images/mixtapes/${item._id}`
    if (!fs.existsSync(artworkFolder))
      mkdirp.sync(artworkFolder)
    const artwork = req.files.artwork[0].buffer
    sharp(artwork)
      .rotate()
      // Resize to 1000px square
      .resize(1000, 1000)
      .toFormat("jpg")
      .toFile(`${artworkFolder}/large.jpg`)
      .then(() => {
        sharp(artwork)
          .rotate()
          // Resize to 200px square
          .resize(300, 300)
          .toFormat("jpg")
          .toFile(`${artworkFolder}/thumbnail.jpg`)
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