const IDs = require("../../ids.json");
const axios = require("axios");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const guild = client.guilds.cache.get(IDs.guild);
    const voiceChannel = guild.channels.cache.get(IDs.minecraftMemberCountChannel);

    if (!guild || !voiceChannel) {
      return console.log("Invalid guild or voice channel for minecraft member count feature.");
    }

    const updateChannelName = async () => {
      try {
        const { data } = await axios.get("https://api.mcsrvstat.us/2/play.surviecraft.fr");

        if (data.online === false) {
          if (voiceChannel.name !== `En jeu: Offline`) {
            voiceChannel.setName(`En jeu: Offline`);
          }
        } else {
          if (voiceChannel.name !== `En jeu: ${data.players.online}`) {
            voiceChannel.setName(`En jeu: ${data.players.online}`);
          }
        }
      } catch (error) {
        if (voiceChannel.name !== `En jeu: Error`) {
          voiceChannel.setName(`En jeu: Error`);
        }
      }

      setTimeout(updateChannelName, 3000 * 60);
    };
    updateChannelName();
  },
};
