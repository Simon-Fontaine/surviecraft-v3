const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const giveawaySchema = require("../../Schemas/Giveaways");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, channel, member, customId } = interaction;

    if (!interaction.isButton() || !member) return;

    const [prefix, giveawayId] = customId.split("-");
    // console.log(prefix, giveawayId);
    if (prefix !== "giveaway" && prefix !== "leavegiveaway") return;

    await interaction.deferReply({ ephemeral: true });

    const doc = await giveawaySchema.findOne({ guildId: guild.id, messageId: giveawayId });
    if (!doc) {
      return interaction.editReply({
        content: "Ce giveaway n'existe pas, veuillez en notifier un membre du staff !",
        ephemeral: true,
      });
    }

    const giveawayChannel = guild.channels.cache.get(doc.channelId);
    if (!giveawayChannel) {
      return interaction.editReply({
        content: "Ce giveaway n'existe pas, veuillez en notifier un membre du staff !",
        ephemeral: true,
      });
    }

    const giveawayMessage = await giveawayChannel.messages.fetch(giveawayId).catch(() => {});
    if (!giveawayMessage) {
      return interaction.editReply({
        content: "Ce giveaway n'existe pas, veuillez en notifier un membre du staff !",
        ephemeral: true,
      });
    }

    if (doc.ended) {
      return interaction.editReply({
        content: "Ce giveaway est déjà terminé !",
        ephemeral: true,
      });
    }

    if (doc.endDate < Date.now()) {
      return interaction.editReply({
        content: "Ce giveaway est déjà terminé !",
        ephemeral: true,
      });
    }

    const winnersCount = doc.winnersCount;
    const hostedBy = doc.hostedBy;
    const endDate = doc.endDate;

    let participants = doc.participants;

    if (prefix === "leavegiveaway") {
      if (!participants.includes(member.id)) {
        return interaction.editReply({
          content: "Vous ne participez pas à ce giveaway !",
          ephemeral: true,
        });
      }

      let index = participants.indexOf(member.id);
      participants.splice(index, 1);

      await interaction.editReply({
        content: "Vous ne participez plus à ce giveaway !",
        ephemeral: true,
      });
    } else {
      if (participants.includes(member.id)) {
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Quittez le Giveaway")
            .setCustomId(`leavegiveaway-${giveawayMessage.id}`)
            .setStyle(ButtonStyle.Danger)
        );

        return interaction.editReply({
          content: "Vous participez déjà à ce giveaway !",
          components: [row],
          ephemeral: true,
        });
      }

      participants.push(member.id);

      await interaction.editReply({
        content: "Vous participez désormais à ce giveaway !",
        ephemeral: true,
      });
    }

    try {
      await giveawaySchema.findOneAndUpdate(
        { guildId: guild.id, messageId: giveawayId },
        { participants: participants }
      );
    } catch (err) {
      console.error(err);

      return interaction.editReply({
        content: "Une erreur est survenue, veuillez en notifier un membre du staff !",
        ephemeral: true,
      });
    }

    const oldEmbed = giveawayMessage.embeds[0];
    const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(
      [
        `Fin dans <t:${Math.floor(endDate.getTime() / 1000)}:R> (<t:${Math.floor(
          endDate.getTime() / 1000
        )}>)`,
        `Hébergé par <@${hostedBy}>`,
        `Participants: **${participants.length}**`,
        `Gagnant${winnersCount > 1 ? "s" : ""}: **${winnersCount}**`,
        ``,
      ].join("\n")
    );

    await giveawayMessage.edit({ embeds: [newEmbed] });
  },
};
