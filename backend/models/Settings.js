const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  statsResetDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Singleton pattern - ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
