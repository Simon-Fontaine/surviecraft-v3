const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Gérer les bans de votre serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("joueur")
        .setDescription("Définir les paramètres des tickets joueurs")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Sélectionnez le channel dans lequel les tickets doivent être créés")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("Sélectionnez le channel parent où les tickets doivent être créés")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addChannelOption((option) =>
          option
            .setName("transcripts")
            .setDescription("Sélectionnez le channel où les transcriptions doivent être envoyées")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((option) =>
          option
            .setName("everyone")
            .setDescription("Sélectionnez le rôle everyone")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("staff")
        .setDescription("Définir les paramètres des tickets staff")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Sélectionnez le channel dans lequel les tickets doivent être créés")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addChannelOption((option) =>
          option
            .setName("category")
            .setDescription("Sélectionnez le channel parent où les tickets doivent être créés")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addChannelOption((option) =>
          option
            .setName("transcripts")
            .setDescription("Sélectionnez le channel où les transcriptions doivent être envoyées")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((option) =>
          option
            .setName("everyone")
            .setDescription("Sélectionnez le rôle everyone")
            .setRequired(true)
        )
    ),
};
