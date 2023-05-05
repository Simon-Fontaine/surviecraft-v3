const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const TicketSetup = require("../../../../Schemas/TicketSetupStaff");
const TicketNumber = require("../../../../Schemas/TicketNumberStaff");
const config = require("../../../../config.json");

module.exports = {
  subCommand: "ticket.staff",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
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
        .setTitle("Chers Staffs ! Ce channel est là pour vous !")
        .setColor(0xff0000)
        .setDescription(
          [
            `Si vous avez quelconques __soucis, problèmes, questionnements importants, signalements__ à faire aux **administrateurs/responsables**, vous pouvez dès maintenant créer un ticket personnel.`,
            "",
            `> **Vous serez le seul à avoir accès à ce ticket.**`,
            ``,
            "*Tous types d'abus de cette fonctionnalité sont sanctionnables par notre équipe.*",
          ].join("\n")
        );

      const actionRow = new ActionRowBuilder({
        components: [
          new StringSelectMenuBuilder({
            custom_id: "ticket_staff_select",
            placeholder: "❔ Auncune option sélectionnée...",
            max_values: 1,
            min_values: 0,
            options: [
              {
                label: "Problème Mot De Passe",
                description: "Perdu votre mot de passe ? C'est ici !",
                value: "Staff - Problème Mot De Passe",
              },
              {
                label: "Problème En Jeu",
                description: "Problème(s) sur notre serveur Minecraft ? C'est ici !",
                value: "Staff - Problème En Jeu",
              },
              {
                label: "Problème Site Web",
                description: "Problème(s) sur note site web ? C'est ici !",
                value: "Staff - Problème Site Web",
              },
              {
                label: "Problème Discord",
                description: "Problème(s) sur notre serveur Discord ? C'est ici !",
                value: "Staff - Problème Discord",
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
          console.log(error);
          return interaction.reply({ content: "Une erreur est survenue.", ephemeral: true });
        });

      interaction.reply({
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
      interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch((error) => {
        console.log(error);
      });
    }
  },
};
