const express = require("express")
const routes = require("./routes/routes")
const app = express()
const fs = require("fs")
const path = require("path")
const { promisify } = require("es6-promisify")
const compression = require("compression")
const mongoose = require("mongoose")
const Channel = mongoose.model("Channel")
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const passport = require("passport")
require("./helpers/passport")
const flash = require("connect-flash")
const bodyParser = require("body-parser")
const expressValidator = require("express-validator")
const device = require("device")
const { logging } = require("./helpers/logging")
const errorHandlers = require("./helpers/errorHandlers")
const { numberFormatter } = require("./helpers/numberFormatter")
const { truncate } = require("./helpers/truncate")
const { hashify } = require("./helpers/hashify")
const cookieParser = require('cookie-parser')
const moment = require('moment')

// Load Pug views
app.set("views", "views")
app.set("view engine", "pug")

// Enable gzip
app.use(compression())

// Set cache headers for static content to 1 year
// Static content should be served by an Nginx proxy in production
const maxAge = process.env.NODE_ENV === "production" ? 31536000 : 1
app.use(express.static(path.join(__dirname, "public"), { maxAge }))

// Parses POST data
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Data validation library
app.use(expressValidator())

// Populates req.cookies with any cookies that came along with the request
app.use(cookieParser())

// Dynamic flash messages that are passed to the template (e.g. "Successfully logged in" or "Incorrect login details")
app.use(flash())

// Set cookies for tracking sessions
app.use(
  session({
    secure: true,
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
)

// PassportJS handles user logins
app.use(passport.initialize())
app.use(passport.session())

// Log non-static requests with a timestamp, HTTP method, path and IP address
app.use(logging)

// Cache-bust CSS files with a query string of the MD5 file hash
// e.g. <link src="main.css?v=7815696ecbf1c96e6894b779456d330e">
// The hash is passed into the template variables further down
const hashes = {
  mainCSS: hashify("/css/main.css"),
  adminArticleForm: hashify("/js/adminArticleForm.js"),
  adminVideoForm: hashify("/js/adminVideoForm.js")
}

// Expose variables and functions for use in Pug templates
app.use(async (req, res, next) => {
  // Parses the User Agent into desktop, phone, tablet, phone, bot or car
  res.locals.device = device(req.headers['user-agent']).type
  // Pass success/error messages into the template
  res.locals.flashes = req.flash()
  // Expose the current user data if logged in
  res.locals.user = req.user || null
  // Expose the public URL for building sharing links etc
  res.locals.publicURL = process.env.PUBLIC_URL
  // Expose the URL path
  res.locals.currentPath = req.path
  // Expose the URL query strings
  res.locals.query = req.query
  // Cache-busting hashes
  res.locals.hashes = hashes
  // For formatting dates
  res.locals.moment = moment
  // For formatting numbers, e.g. 198,485 to 198K
  res.locals.numberFormatter = numberFormatter
  // Safely format descriptions
  res.locals.truncate = truncate
  // P110 Youtube channel stats
  res.locals.channelStats = await Channel.getStats()
  // Detect production mode for inlining CSS
  if (process.env.NODE_ENV === "production") {
    res.locals.production = true
  }
  next()
})

// Promisify the login API
app.use((req, res, next) => {
  req.login = promisify(req.login, req)
  next()
})

// Load the routes
app.use("/", routes)

// 404 if no routes are found
app.use((req, res, next) => {
  if (req.accepts("html") && res.status(404)) {
    // Avoid spamming 404 console errors when sitemap is generated
    // The sitemap tries all kinds of weird URLs so there are lots of 404s
    if (!req.headers['user-agent'].includes('Node/SitemapGenerator')) {
      console.error(`🚫  🔥  Error 404 ${req.method} ${req.path}`)
    }
    res.render("404")
  }
})

// Flashes Mongo errors
app.use(errorHandlers.flashValidationErrors)

if (process.env.NODE_ENV === "production")
  app.use(errorHandlers.productionErrors)
else
  app.use(errorHandlers.developmentErrors)

module.exports = app