// Docs at https://github.com/google/google-api-nodejs-client/

const { google } = require('googleapis')
const youtube = google.youtube('v3')
const OAuth2 = google.auth.OAuth2;
const credentials = require("../variables.google.json")

const mongoose = require("mongoose");
const formatTitle = require("../helpers/formatTitle");
const detectCategory = require("../helpers/detectCategory");
const User = mongoose.model("User");
const Video = mongoose.model("Video");

const CHANNEL_ID = "UC_2WoPonjo8MdKOF5VCpr9g"

var oauth2Client = new OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

oauth2Client.setCredentials({
  access_token: credentials.access_token,
  refresh_token: credentials.refresh_token
});

google.options({
  auth: oauth2Client
});

exports.searchById = (id, part = 'snippet,contentDetails,statistics') => {
  return new Promise((resolve, reject) => {
    if (!id) return reject("Please supply a valid Youtube ID")
    console.log("Fetching data for Youtube ID " + id)
    youtube.videos.list({ id, part }, (err, res) => {
      if (err) {
        console.log(err)
        reject("Bad request")
      } else if (res.data.items.length === 0) {
        reject("No videos found")
      } else {
        resolve(res.data.items[0])
      }
    })
  })
}

exports.getChannelStats = () => {
  return new Promise(async (resolve, reject) => {
    const [stats, hottestVideos] = await Promise.all([
      this.getOverviewStats(),
      this.getHottestVideoStats()
    ])
    if (!stats || !hottestVideos)
      return reject("Error updating channel stats")
    stats.hottestVideos = hottestVideos
    resolve(stats)
  })
}

exports.getOverviewStats = () => {
  return new Promise((resolve, reject) => {
    const params = {
      id: CHANNEL_ID,
      part: "statistics"
    }
    youtube.channels.list(params, (err, res) => {
      if (err) {
        console.log("Error fetching channel stats")
        console.log(err)
        reject()
      } else if (res.data.items.length === 0) {
        console.log("No channels found")
        reject()
      } else {
        resolve(res.data.items[0].statistics)
      }
    })
  })
}

exports.getHottestVideoStats = () => {
  return new Promise((resolve, reject) => {
    const thisMonth = new Date()
    thisMonth.setMonth(thisMonth.getMonth() - 1)
    const params = {
      channelId: CHANNEL_ID,
      publishedAfter: thisMonth,
      part: "snippet",
      order: "viewCount",
      maxResults: "5"
    }
    youtube.search.list(params, (err, res) => {
      if (err) {
        console.log("Error fetching channel stats")
        console.log(err)
        reject()
      } else if (res.data.items.length === 0) {
        console.log("No channels found")
        reject()
      } else {
        res.data.items.forEach((video, i) => {
          console.log(video.id.videoId)
          this.searchById(video.id.videoId, "statistics")
            .then(data => {
              res.data.items[i].statistics = data.statistics
              if (i === res.data.items.length - 1)
                setTimeout(() => {
                  resolve(res.data.items)
                }, 1000)
            })
        })
      }
    })
  })
}

// Searches for the latest 50 videos and adds them to the database
exports.scrapeLatestVideos = () => {
  return new Promise((resolve, reject) => {
    console.log("Scraping latest 50 videos")

    const params = {
      channelId: CHANNEL_ID,
      type: "video",
      part: "snippet",
      maxResults: "50",
      order: "date"
    }


    let results = []

    youtube.search.list(params, (err, res) => {
      if (err) return reject(err)
      res.data.items.reverse().forEach(async (item, i) => {
        const videoExists = await Video.findOne({ youtubeId: item.id.videoId })
        if (videoExists) {
          console.log("Video already exists: " + item.snippet.title)
          return
        }
        const singleParams = {
          id: item.id.videoId,
          part: 'snippet'
        }
        youtube.videos.list(singleParams, (err, singleRes) => {
          if (err) {
            reject(err)
          } else {
            const title = formatTitle(item.snippet.title)
            const data = {
              title,
              youtubeId: item.id.videoId,
              category: detectCategory(item.snippet.title),
              description: singleRes.data.items[0].snippet.description,
              rawData: item
            }
            results.push(data)
          }
        })
      })

      // Give all the requests time to resolve before saving to DB
      // Messy, should be Promise.all
      setTimeout(saveItems, 3000)

    })

    const saveItems = () => {
      results.sort((a, b) => {
        return Date.parse(a.rawData.snippet.publishedAt) > Date.parse(b.rawData.snippet.publishedAt)
      })
      results.forEach(result => {
        result.published = Date.parse(result.rawData.snippet.publishedAt)
        const videoSave = Video.findOneAndUpdate({
          youtubeId: result.youtubeId
        },
          result,
          { upsert: true },
          err => {
            if (err) {
              console.log("Error saving video")
            } else {
              console.log("Saved video: " + result.title)
            }
          });
      })
      console.log("Successfully scraped latest 50 videos")
      resolve(results.length)
    }
  })

}