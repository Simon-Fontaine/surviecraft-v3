const { model, Schema } = require("mongoose");

module.exports = model(
  "TicketSetupStaff",
  new Schema({
    GuildID: String,
    Channel: String,
    Category: String,
    Transcripts: String,
    Handlers: String,
    Everyone: String,
    Description: String,
    Button: String,
    Emoji: String,
  })
);
