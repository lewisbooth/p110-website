const mongoose = require("mongoose");
const Settings = mongoose.model("Settings");

exports.checkSettingsExist = async () => {
  const settings = await Settings.findOne()
  if (settings) {
    return
  } else {
    const defaultSettings = await new Settings().save(err => {
      if (err) {
        console.log('Error creating default settings')
        console.log(err)
      } else {
        console.log('Created default settings')
      }
    });
  }
}