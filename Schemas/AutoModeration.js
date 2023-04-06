const { model, Schema } = require("mongoose");

const reqString = {
  type: String,
};

module.exports = model(
  "user-auto-moderation-schema",
  new Schema({
    guild_id: reqString,
    user_id: reqString,
    number_of_actions: {
      type: Number,
      default: 0,
    },
  })
);
