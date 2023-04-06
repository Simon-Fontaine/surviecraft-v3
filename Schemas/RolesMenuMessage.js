const { model, Schema } = require("mongoose");

module.exports = model(
  "RolesMenuMessage",
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
