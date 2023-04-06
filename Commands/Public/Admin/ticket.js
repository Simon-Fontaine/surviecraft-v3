const { PermissionFlagsBits, ChannelType } = require("discord.js");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
const TicketSetup = require("../../../Schemas/TicketSetup");
const TicketNumber = require("../../../Schemas/TicketNumber");
const config = require("../../../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Une commande pour configurer le système de tickets")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
      option.setName("everyone").setDescription("Sélectionnez le rôle everyone").setRequired(true)
    ),
  async execute(interaction) {
    const { guild, options } = interaction;
    try {
      const channel = options.getChannel("channel");
      const category = options.getChannel("category");
      const transcripts = options.getChannel("transcripts");
      const everyone = options.getRole("everyone");

      await TicketSetup.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Channel: channel.id,
          Category: category.id,
          Transcripts: transcripts.id,
          Everyone: everyone.id,
        },
        {
          new: true,
          upsert: true,
        }
      );

      await TicketNumber.findOneAndUpdate(
        { GuildID: guild.id },
        {
          Number: 0,
        },
        {
          new: true,
          upsert: true,
        }
      );

      const embed = new EmbedBuilder()
        .setTitle("Un Problème ? Ouvre un Ticket !")
        .setColor(0xfcba03)
        .setDescription(
          [
            `Pour pouvoir discuter avec des membres du staff merci de **sélectionner** une option dans le **menu de sélection** ci-dessous.`,
            "",
            `> Tous les tickets dont nous n'avons pas de réponses de votre part sous 24h seront automatiquement fermés.`,
            ``,
            "*Tous types d'abus de cette fonctionnalité sont sanctionnables par notre équipe.*",
          ].join("\n")
        );

      const actionRow = new ActionRowBuilder({
        components: [
          new StringSelectMenuBuilder({
            custom_id: "ticket_joueur_select",
            placeholder: "❔ Auncune option sélectionnée...",
            max_values: 1,
            min_values: 0,
            options: [
              {
                label: "Problème Mot De Passe",
                description: "Perdu votre mot de passe ? C'est ici !",
                value: "Problème Mot De Passe",
              },
              {
                label: "Problème En Jeu",
                description: "Problème(s) sur notre serveur Minecraft ? C'est ici !",
                value: "Problème En Jeu",
              },
              {
                label: "Problème Site Web",
                description: "Problème(s) sur note site web ? C'est ici !",
                value: "Problème Site Web",
              },
              {
                label: "Problème Discord",
                description: "Problème(s) sur notre serveur Discord ? C'est ici !",
                value: "Problème Discord",
              },
            ],
          }),
        ],
      });

      await guild.channels.cache
        .get(channel.id)
        .send({
          embeds: [embed],
          components: [actionRow],
        })
        .catch((error) => {
          return;
        });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Le système de ticket a été créé avec succès.")
            .setColor(null),
        ],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      const errEmbed = new EmbedBuilder().setColor(0xff0000).setDescription(config.ticketError);
      return interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch((error) => {
        return;
      });
    }
  },
};
