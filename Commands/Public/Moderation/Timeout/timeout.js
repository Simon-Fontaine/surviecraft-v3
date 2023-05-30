const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Gérer les timeouts de votre serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Timeout un membre de votre serveur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Mention de l'utilisateur que vous souhaitez timeout")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("La raison de l'ajout ce timeout")
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
            .setName("dm")
            .setDescription("DM l'utilisateur au moment du timeout")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Enlève un timeout à un membre de votre serveur")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Mention de l'utilisateur que vous souhaitez modérer")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Indiquer la raison de la suppression du timeout")
            .setMaxLength(300)
            .setRequired(false)
        )
        .addAttachmentOption((option) =>
          option.setName("proof").setDescription("Ajouter une pièce jointe").setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("dm")
            .setDescription("DM l'utilisateur lors de la suppression de son timeout")
            .setRequired(false)
        )
    ),
};
