const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const config = require("../../config.json");
const giveawaySchema = require("../../Schemas/Giveaways");

const { isHighStaff } = require("../../Functions/roleChecker");
const { parseTime } = require("../../Functions/timeCalculator");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, member, customId } = interaction;

    if (!interaction.isModalSubmit()) return;

    if (!["giveaway_modal"].includes(customId)) return;

    await interaction.deferReply({ ephemeral: true });

    await interaction.editReply({ content: "Chargement..." });

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isHighStaff(member)) {
      return interaction.editReply({ embeds: [nopermissionsEmbed] });
    }

    const durationInput = interaction.fields.getTextInputValue("duration_input");
    const numberWinnersInput = interaction.fields.getTextInputValue("number_winners_input");
    const titleInput = interaction.fields.getTextInputValue("title_input");
    const descriptionInput = interaction.fields.getTextInputValue("description_input");

    if (!durationInput || !numberWinnersInput || !titleInput || !descriptionInput) {
      return interaction.editReply({
        content: "Veuillez remplir tous les champs du formulaire !",
        ephemeral: true,
      });
    }

    if (isNaN(numberWinnersInput)) {
      return interaction.editReply({
        content: `Je n'ai pas pu convertir \`${numberWinnersInput}\` en nombre`,
        ephemeral: true,
      });
    }

    if (Number(numberWinnersInput) < 1) {
      return interaction.editReply({
        content: `Le nombre de gagnants doit être supérieur à 0`,
        ephemeral: true,
      });
    }

    const endDate = parseTime(durationInput);

    if (!endDate) {
      return interaction.editReply({
        content: `Je n'ai pas pu convertir \`${durationInput}\` en date`,
        ephemeral: true,
      });
    }

    const giveawayMessageContent = [titleInput, "", descriptionInput].join("\n");

    const giveawayEmbed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(
        [
          `Fin dans <t:${Math.floor(endDate.getTime() / 1000)}:R> (<t:${Math.floor(
            endDate.getTime() / 1000
          )}>)`,
          `Hébergé par <@${member.id}>`,
          `Participants: **0**`,
          `Gagnant${numberWinnersInput > 1 ? "s" : ""}: **${numberWinnersInput}**`,
          ``,
        ].join("\n")
      )
      .setFooter({ text: "Réagissez avec 🎉 pour participer !" })
      .setTimestamp();

    let giveawayMessage;
    try {
      giveawayMessage = await channel.send({
        content: giveawayMessageContent,
        embeds: [giveawayEmbed],
        fetchReply: true,
      });
    } catch (err) {
      return interaction.editReply({
        content: "Une erreur est survenue lors de la création du giveaway",
        ephemeral: true,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Participer")
        .setCustomId(`giveaway-${giveawayMessage.id}`)
        .setEmoji({ name: "🎉" })
        .setStyle(ButtonStyle.Secondary)
    );

    await giveawayMessage.edit({ components: [row] });

    try {
      await giveawaySchema.create({
        messageId: giveawayMessage.id,
        channelId: channel.id,
        guildId: guild.id,
        startDate: new Date(),
        endDate: endDate,
        title: titleInput,
        description: descriptionInput,
        winnersCount: Number(numberWinnersInput),
        hostedBy: member.id,
      });
    } catch (err) {
      console.log(err);
      return interaction.editReply({
        content: "Une erreur est survenue lors de la création du giveaway",
        ephemeral: true,
      });
    }

    await interaction.editReply({
      content: `Le giveaway a été créé avec succès ${giveawayMessage.url} !`,
      ephemeral: true,
    });
  },
};
