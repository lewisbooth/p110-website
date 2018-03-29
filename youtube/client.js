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
    if (!id) {
      reject("Please supply a valid Youtube ID")
      return
    }
    console.log("Fetching data for Youtube ID " + id)
    const params = { id, part }
    youtube.videos.list(params, (err, res) => {
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

exports.channelStats = () => {
  return new Promise((resolve, reject) => {
    console.log("Fetching stats for P110 channel")
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
        resolve(res.data.items[0])
      }
    })
  })
}

// Searches for the latest 50 videos and adds them to the database
const dumpLatestVideos = () => {

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
    if (err) {
      console.log(err)
    } else {
      console.log(res.data.nextPageToken)
      res.data.items.reverse().forEach((item, i) => {
        const singleParams = {
          id: item.id.videoId,
          part: 'snippet'
        }
        youtube.videos.list(singleParams, (err, singleRes) => {
          if (err) {
            console.log(err)
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
            if (i === res.data.items.length - 1) {
              setTimeout(saveItems, 3000)
            }
          }
        })

      })
    }
  })

  const saveItems = () => {
    results.sort((a, b) => {
      return Date.parse(a.rawData.snippet.publishedAt) > Date.parse(b.rawData.snippet.publishedAt)
    })
    results.forEach(result => {
      const videoSave = new Video(result).save(err => {
        if (err) {
          console.log(err)
        } else {
          console.log("Saved " + result.title)
        }
      });
    })
  }

}