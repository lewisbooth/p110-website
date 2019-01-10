// Load environment variables
require("dotenv").config({ path: "variables.env" })

const mongoose = require("mongoose")
const cron = require("node-cron")
const ip = require("ip")
const mongo = require("./helpers/mongo")
const sitemap = require("./helpers/sitemap")

// Expose an easy path to root directory for scripts that are nested in folders
process.env.ROOT = __dirname

// Initiate the database connection
mongoose.connect(process.env.DATABASE, {
  autoReconnect: true,
  reconnectTries: 100,
  reconnectInterval: 5000,
  useNewUrlParser: true
}, err => {
  if (err)
    console.error("🚫 Error connecting to MongoDB")
  else
    console.log("Connected to MongoDB")
})

// Use better promises for Mongo queries
mongoose.Promise = global.Promise

// Load the MongoDB models
const User = require("./models/User")
const Video = require("./models/Video")
const Article = require("./models/Article")
const Mixtape = require("./models/Mixtape")
const Settings = require("./models/Settings")
const Channel = require("./models/Channel")
const { scrapeLatestVideos } = require("./youtube/client")

// Update stats every 6 hours
// Includes total channel views, hottest videos etc
cron.schedule("0 */6 * * *", () => {
  Channel.getStats()
})

// Schedule daily backups at 4am
// Manual database management is available using helpers/mongo-backup.js and helpers/mongo-restore.js
cron.schedule("0 4 * * *", () => {
  mongo.backup()
})

// Schedule daily sitemaps at 5am
cron.schedule("0 5 * * *", () => {
  sitemap.generate()
})

// Scrape for any new videos at 6am
cron.schedule("0 */6 * * *", () => {
  scrapeLatestVideos()
})

// Skipped if sitemap is < 6 hours old
sitemap.generate()

// Load server scripts
const app = require("./app")
app.set("port", process.env.PORT || 8888)

// Initiate the server
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`)
  if (process.env.NODE_ENV === "production")
    console.log("⚡  Production Mode ⚡")
  else
    console.log("🐌  Development Mode 🐌 ")
  console.log("Local address: " + ip.address())
})
