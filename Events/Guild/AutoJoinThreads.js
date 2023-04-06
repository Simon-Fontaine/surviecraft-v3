const { ThreadChannel } = require("discord.js");

module.exports = {
  name: "threadCreate",
  /**
   *
   * @param {ThreadChannel} thread
   */
  execute(thread) {
    thread.join();
  },
};
