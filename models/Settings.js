const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongodbErrorHandler = require("mongoose-mongodb-errors");
mongoose.Promise = global.Promise;

const settingsSchema = new Schema({
  featuredVideo: {
    type: Schema.Types.ObjectId,
    ref: "Video"
  }
});

settingsSchema.plugin(mongodbErrorHandler);

settingsSchema.statics.getFeaturedVideo = async function () {
  const settings = await this
    .findOne()
    .populate('featuredVideo')
  return settings.featuredVideo
};

settingsSchema.statics.setFeaturedVideo = async function (itemId) {
  const update = await this
    .findOneAndUpdate({},
      {
        $set: {
          featuredVideo: itemId
        }
      },
      { upsert: true },
      (err, item) => {
        if (err || !item) {
          console.log('Error updating featured video')
          console.log(err)
          return;
        }
        item.save().then(saved => {
          console.log("Updated featured video")
        });
      }
    );
}

module.exports = mongoose.model("Settings", settingsSchema);
