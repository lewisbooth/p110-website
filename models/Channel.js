const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const youtube = require('../youtube/client')
mongoose.Promise = global.Promise;

const channelSchema = new Schema(
  {
    viewCount: { type: Number },
    commentCount: { type: Number },
    subscriberCount: { type: Number },
    videoCount: { type: Number }
  },
  {
    timestamps: true
  }
);

channelSchema.statics.getStats = async function () {
  return new Promise(async (resolve, reject) => {
    const currentStats = await this.findOne()
    const currentTime = Date.now()
    const age = currentTime - Date.parse(currentStats.updatedAt)
    // 6 hour cache
    if (age < 21600000) resolve(currentStats)
    channelSchema.statics.updateStats(this).then(updatedStats => {
      resolve(updatedStats)
    })
  })
};

channelSchema.statics.updateStats = function (model) {
  return new Promise((resolve, reject) => {
    youtube.getChannelStats().then(async stats => {
      const videoSave = await model.findOneAndUpdate(
        {},
        stats,
        { upsert: true },
        (err, item) => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            console.log("Successfully updated P110 channel stats")
            resolve(stats)
          }
        }
      );
    })
  })
}

channelSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("Channel", channelSchema);
