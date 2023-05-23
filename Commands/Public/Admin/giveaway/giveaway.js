const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Gérer les giveaways de votre serveur")
    // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Créer un nouveau giveaway via un menu interactif")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("Terminer un giveaway")
        .addStringOption((option) =>
          option
            .setName("giveaway_id")
            .setDescription("L'ID du giveaway à terminer")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Supprimer un giveaway")
        .addStringOption((option) =>
          option
            .setName("giveaway_id")
            .setDescription("L'ID du giveaway à supprimer")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reroll")
        .setDescription("Reroll un giveaway")
        .addStringOption((option) =>
          option
            .setName("giveaway_id")
            .setDescription("L'ID du giveaway à reroll")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("Lister les giveaways du serveur")
    ),
};
