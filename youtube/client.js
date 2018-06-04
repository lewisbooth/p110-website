// Docs at https://github.com/google/google-api-nodejs-client/

const { google } = require('googleapis')
const youtube = google.youtube('v3')
const OAuth2 = google.auth.OAuth2;
const credentials = require("../variables.google.json")

const mongoose = require("mongoose");
const User = mongoose.model("User");
const Video = mongoose.model("Video");

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
  return new Promise((resolve, reject) => {
    const params = {
      id: "UC_2WoPonjo8MdKOF5VCpr9g",
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

// Searches for the latest 50 videos and adds them to the database
exports.scrapeLatestVideos = () => {
  return new Promise((resolve, reject) => {
    console.log("Scraping latest 50 videos")

    const params = {
      channelId: "UC_2WoPonjo8MdKOF5VCpr9g",
      type: "video",
      part: "snippet",
      maxResults: "50",
      order: "date"
    }

    const detectCategory = title => {
      if (title.match(/P110 Premiere/i)) return "music-video"
      if (title.match(/Scene Smasher/i)) return "scene-smasher"
      if (title.match(/Music Video/i)) return "music-video"
      if (title.match(/Net Video/i)) return "net-video"
      if (title.match(/#1TAKE/i)) return "1take"
      return "music-video"
    }

    const formatTitle = string => {
      return string
        .replace(/P110 - /i, '')
        .replace(/\| P110/i, '')
        .replace(/\[.*\]/i, '')
        .replace(/- #1TAKE/i, '')
        .replace(/\| #1TAKE/i, '')
        .replace(/#1TAKE/i, '')
        .replace(/- Scene Smasher/i, '')
        .replace(/Scene Smasher/i, '')
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