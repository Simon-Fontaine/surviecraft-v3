const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  developer: true,
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Recharge toutes les commandes ou tous les événements.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((options) =>
      options.setName("events").setDescription("Recharge tous les événements.")
    )
    .addSubcommand((options) =>
      options.setName("commands").setDescription("Recharge toutes les commandes.")
    ),
};
