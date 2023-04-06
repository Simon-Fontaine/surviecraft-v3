const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Suppression en masse de messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("all")
        .setDescription("Supprimer tous les messages dans le channel")
        .addIntegerOption((option) =>
          option
            .setName("count")
            .setDescription("Nombre de messages à supprimer")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Supprimer les messages d'un utilisateur spécifique")
        .addIntegerOption((option) =>
          option
            .setName("count")
            .setDescription("Nombre de messages à supprimer")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Utilisateur dont les messages seront supprimés")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("bot")
        .setDescription("Supprimer les messages des bots")
        .addIntegerOption((option) =>
          option
            .setName("count")
            .setDescription("Nombre de messages à supprimer")
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
    ),
};
