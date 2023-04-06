const { model, Schema } = require("mongoose");

module.exports = model(
  "RulesMessage",
  new Schema({
    _id: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
    },
  })
);
