const { model, Schema } = require("mongoose");

module.exports = model(
  "VoiceChannel",
  new Schema({
    GuildID: String,
    ChannelID: String,
  })
);
