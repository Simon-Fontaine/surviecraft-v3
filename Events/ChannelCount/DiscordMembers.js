const IDs = require("../../ids.json");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const guild = client.guilds.cache.get(IDs.guild);
    const voiceChannel = guild.channels.cache.get(IDs.discordMemberCountChannel);

    if (!guild || !voiceChannel) {
      return console.log("Invalid guild or voice channel for discord member count feature.");
    }

    const updateChannelName = () => {
      if (voiceChannel.name !== `Membres Discord: ${guild.memberCount.toLocaleString()}`) {
        voiceChannel.setName(`Membres Discord: ${guild.memberCount.toLocaleString()}`);
      }

      setTimeout(updateChannelName, 3000 * 60);
    };
    updateChannelName();
  },
};
