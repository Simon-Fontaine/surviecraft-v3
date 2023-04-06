const { model, Schema } = require("mongoose");

module.exports = model(
  "Ticket",
  new Schema(
    {
      GuildID: String,
      Type: String,
      OwnerID: String,
      OwnerTag: String,
      ModID: String,
      ModTag: String,
      MembersID: [String],
      TicketID: String,
      ChannelID: String,
      Locked: Boolean,
      Claimed: Boolean,
    },
    {
      timestamps: true,
    }
  )
);
