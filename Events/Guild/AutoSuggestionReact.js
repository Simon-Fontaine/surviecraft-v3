const { ThreadChannel, ChannelType } = require("discord.js");
const IDs = require("../../ids.json");

module.exports = {
  name: "threadCreate",
  /**
   *
   * @param {ThreadChannel} thread
   */
  async execute(thread) {
    if (thread.type !== ChannelType.PublicThread) return;
    if (thread.parentId !== IDs.suggestionChannel) return;

    const message = await thread.messages.fetch(thread.id);
    message.react("👍🏼");
  },
};
