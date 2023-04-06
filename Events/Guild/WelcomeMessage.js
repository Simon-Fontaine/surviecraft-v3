const { GuildMember, EmbedBuilder } = require("discord.js");
const IDs = require("../../ids.json");

module.exports = {
  name: "guildMemberAdd",
  /**
   *
   * @param {GuildMember} member
   */
  execute(member) {
    const welcomeChannel = member.guild.channels.cache.get(IDs.welcomeChannel);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: "Bienvenue",
        iconURL: member.user.avatarURL({ dynamic: true }) ?? member.user.defaultAvatarURL,
      })
      .setDescription(
        [
          `Bienvenue dans notre communauté !`,
          `Nous vous invitons à vous familiariser avec notre <#${IDs.rulesChannel}>.`,
        ].join("\n")
      )
      .setFooter({
        text: `User: ${member.user.tag} | ID: ${member.user.id} | Nombre: ${member.guild.memberCount}`,
      });

    welcomeChannel.send({ content: `${member.user}`, embeds: [embed] });
  },
};
