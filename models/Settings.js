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

module.exports = mongoose.model("Settings", settingsSchema);
