const { model, Schema } = require("mongoose");

const reqString = {
  type: String,
};

module.exports = model(
  "history-schema",
  new Schema({
    case_id: {
      type: Number,
    },
    type: reqString,
    type_name: reqString,
    user_tag: reqString,
    user_id: reqString,
    user_avatar: reqString,
    mod_tag: reqString,
    mod_id: reqString,
    reason: reqString,
    msg_id: reqString,
    guild_id: reqString,
    unix_time: reqString,
    format_time: reqString,
    expires: {
      type: Date,
    },
    duration: reqString,
    edited: {
      type: Boolean,
      default: false,
    },
    opened: {
      type: Boolean,
      default: true,
    },
    unbanned: {
      type: Boolean,
      default: false,
    },
  })
);
