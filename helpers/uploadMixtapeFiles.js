const fs = require("fs")
const sharp = require("sharp")
const mkdirp = require("mkdirp")
const writeFile = require("write");

exports.uploadMixtapeFiles = (req, item) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      uploadMixtapeCoverImage(req, item),
      uploadMixtapeZip(req, item),
      updateMixtapeZipTitle(item)
    ]).then(() =>
      resolve()
    ).catch(err => {
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
      if (err)
        reject(err)
      else
        resolve()
    })
  })
}

// Updates the file name for the ZIP to the latest Mixtape title
updateMixtapeZipTitle = (item) => {
  return new Promise((resolve, reject) => {
    const targetFolder = `${process.env.ROOT}/public/mixtapes/${item._id}`
    // If the folder doesn't exist, it's currently being created for the first time by uploadMixtapeZip() with the correct title so we can skip this function
    if (!fs.existsSync(targetFolder))
      return resolve()
    // There's only one file in each directory, so we can just select the first file and rename it using the new title.
    const files = fs.readdir(targetFolder, (err, files) => {
      if (err) reject(err)
      const targetFile = `${targetFolder}/${files[0]}`
      const renamedFile = `${targetFolder}/${item.fullTitle}.zip`
      if (!fs.existsSync(targetFile)) resolve()
      fs.rename(targetFile, renamedFile, err => {
        if (err)
          reject(err)
        else
          resolve()
      })
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