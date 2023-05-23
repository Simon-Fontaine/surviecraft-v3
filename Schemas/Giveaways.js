const { model, Schema } = require("mongoose");

const reqString = {
  type: String,
};

module.exports = model(
  "giveaways-schema",
  new Schema({
    messageId: reqString,
    winnerMessageId: String,
    channelId: reqString,
    guildId: reqString,
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    title: reqString,
    description: reqString,
    winnersCount: {
      type: Number,
      default: 1,
      required: true,
    },
    hostedBy: reqString,
    participants: {
      type: [String],
      default: [],
    },
    ended: {
      type: Boolean,
      default: false,
    },
  })
);
