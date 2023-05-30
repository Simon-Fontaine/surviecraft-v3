const { PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Gérer les cas de modération de votre serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Consultez les cas de votre serveur ou d'un cas spécifique.")
        .addIntegerOption((option) =>
          option
            .setName("case")
            .setDescription("L'identifiant du cas")
            .setMinValue(1)
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Quel type de cas filtrer")
            .setChoices(
              { name: "Ban", value: "+ban" },
              { name: "Kick", value: "+kick" },
              { name: "Timeout", value: "+timeout" },
              { name: "Warn", value: "+warn" },
              { name: "Timeout Removal", value: "-timeout" },
              { name: "Unban", value: "-ban" }
            )
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Le membre dont vous souhaitez voir les cas")
            .setRequired(false)
        )
        .addUserOption((option) =>
          option
            .setName("mod")
            .setDescription("Acrtions de modération faites par ce staff")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("modify")
        .setDescription("Modifier un cas de modération")
        .addIntegerOption((option) =>
          option
            .setName("case")
            .setDescription("L'identifiant du cas")
            .setMinValue(1)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("La nouvelle raison de ce cas")
            .setMaxLength(300)
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName("state")
            .setDescription("Si ce dossier doit être actif ou non")
            .setRequired(false)
        )
    ),
};
