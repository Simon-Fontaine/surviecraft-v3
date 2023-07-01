const { GuildMember, ChannelType } = require("discord.js");

const voiceChannelSchema = require("../../Schemas/VoiceChannels");
const IDs = require("../../ids.json");

module.exports = {
  name: "voiceStateUpdate",
  /**
   *
   * @param {GuildMember} oldState
   * @param {GuildMember} newState
   */
  async execute(oldState, newState) {
    if (newState.channelId === IDs.tempChannel) {
      const channel = await newState.guild.channels.create({
        name: `${newState.member.user.username}'s Channel`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parent,
        reason: `Temporary Channel: ${newState.member.user.username} created a channel`,
      });

      await newState.setChannel(channel, "Temporary Channel: Moved to the new channel");

      await voiceChannelSchema.create({
        GuildID: newState.guild.id,
        ChannelID: channel.id,
      });
    } else if (oldState.channelId && oldState.channel.members.size === 0) {
      const oldVoiceChannel = await voiceChannelSchema.findOne({
        GuildID: oldState.guild.id,
        ChannelID: oldState.channelId,
      });

      if (oldVoiceChannel) {
        await voiceChannelSchema.findOneAndDelete({
          GuildID: oldState.guild.id,
          ChannelID: oldState.channelId,
        });

        await oldState.channel.delete("Temporary Channel: No one is in the channel");
      }
    }
  },
};
