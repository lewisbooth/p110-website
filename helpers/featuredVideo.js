const mongoose = require("mongoose");
const Settings = mongoose.model("Settings");
const Video = mongoose.model("Video");

exports.setFeaturedVideo = async itemId => {
  const update = await Settings.findOneAndUpdate({},
    {
      $set: {
        featuredVideo: itemId
      }
    },
    { new: true },
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

exports.getFeaturedVideo = async () => {
  const settings = await Settings
    .findOne()
    .populate('featuredVideo')
  return settings.featuredVideo
}