const { model, Schema } = require("mongoose");

module.exports = model(
  "TicketNumberStaff",
  new Schema({
    GuildID: String,
    Number: Number,
  })
);
