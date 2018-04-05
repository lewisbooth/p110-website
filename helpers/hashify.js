const fs = require("fs");
const path = require("path");
const md5 = require("md5");

exports.hashify = (filePath, publicFolder = "../public") => {
  const relativePath = path.join(__dirname, publicFolder, filePath)
  const file = fs.readFileSync(relativePath)
  const hash = md5(file)
  return `${filePath}?hash=${hash}`
}