const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");

const config = require("../../config.json");
const IDs = require("../../ids.json");
const emojis = require("../../emojis.json");
const { isHighStaff } = require("../../Functions/roleChecker");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, customId } = interaction;

    if (!interaction.isModalSubmit()) return;

    if (!["broadcast_modal"].includes(customId)) return;

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isHighStaff(member)) {
      return interaction.reply({ embeds: [nopermissionsEmbed] });
    }

    const broadcastMessage = interaction.fields.getTextInputValue("broadcast_message_input");

    const annChannel = guild.channels.cache.get(IDs.announcementChannel);

    annChannel
      .send({
        content: broadcastMessage,
      })
      .catch((error) => {
        interaction.reply({
          content: "Une erreur est survenue lors de l'envoie du message",
          ephemeral: true,
        });
        return console.error(error);
      });

    interaction.reply({
      content: `Message envoyé avec succès dans ${annChannel}`,
      ephemeral: true,
    });
  },
};
