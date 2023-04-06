const { StringSelectMenuInteraction } = require("discord.js");
const IDs = require("../../ids.json");
const config = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {StringSelectMenuInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.isStringSelectMenu() || interaction.channelId !== IDs.rolesChannel) {
      return;
    }

    const { customId, values, member } = interaction;

    if (customId === "role_select" && member) {
      const component = interaction.component;
      const removed = component.options.filter((role) => !values.includes(role.value));
      for (const id of removed) {
        member.roles.remove(id.value);
      }

      for (const id of values) {
        member.roles.add(id);
      }

      interaction.reply({
        ephemeral: true,
        content: config.roleMenuUpdated,
      });
    }
  },
};
