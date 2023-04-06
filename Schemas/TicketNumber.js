const { model, Schema } = require("mongoose");

module.exports = model(
  "TicketNumber",
  new Schema({
    GuildID: String,
    Number: Number,
  })
);
