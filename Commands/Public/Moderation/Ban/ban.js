const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Gérer les bans de votre serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Ban un membre de votre serveur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Mention de l'utilisateur que vous souhaitez ban")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("La raison de ce ban")
            .setMaxLength(300)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Indiquer la durée au format 5s 1h 30m")
            .setRequired(false)
        )
        .addAttachmentOption((option) =>
          option.setName("proof").setDescription("Ajouter une pièce jointe").setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("force")
            .setDescription("Bannir explicitement l'utilisateur s'il n'est PAS dans votre serveur")
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("soft")
            .setDescription(
              "Banner puis unban instantanément le membre, supprime les messages précédents si spécifié"
            )
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("purge_days")
            .setDescription("Purge les messages envoyés au cours des derniers jours spécifiés")
            .setMaxValue(7)
            .setMinValue(0)
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("dm")
            .setDescription("DM l'utilisateur au moment du ban")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Unban un membre de votre serveur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Mention de l'utilisateur que vous souhaitez unban")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Indiquer la raison de la suppression du ban")
            .setMaxLength(300)
            .setRequired(false)
        )
        .addAttachmentOption((option) =>
          option.setName("proof").setDescription("Ajouter une pièce jointe").setRequired(false)
        )
    ),
};
