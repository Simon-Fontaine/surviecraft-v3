const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
} = require("discord.js");
const giveawaySchema = require("../../../../Schemas/Giveaways");
const { isHighStaff } = require("../../../../Functions/roleChecker");
const config = require("../../../../config.json");

function selectWinners(participants, winnersCount, guild) {
  const participantsAsMembers = participants
    .map((id) => guild.members.cache.get(id))
    .filter((member) => !!member);

  if (participantsAsMembers.length === 0) return [];

  const tempCollection = new Collection();
  participantsAsMembers.forEach((member) => tempCollection.set(member.id, member));

  const winners = tempCollection.random(winnersCount);

  return Array.isArray(winners) ? winners : [winners];
}

module.exports = {
  subCommand: "giveaway.reroll",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options, member } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isHighStaff(member)) {
      return interaction.editReply({ embeds: [nopermissionsEmbed] });
    }

    const id = options.getString("giveaway_id");

    const doc = await giveawaySchema.findOne({ guildId: guild.id, messageId: id });

    if (!doc) {
      return interaction.editReply({
        content: "Ce giveaway n'existe pas, veuillez essayez avec un autre ID !",
      });
    }

    if (!doc.ended) {
      return interaction.editReply({
        content: "Ce giveaway n'est pas terminé !",
      });
    }

    const channel = guild.channels.cache.get(doc.channelId);
    if (!channel) {
      return interaction.editReply({
        content: "Le channel du giveaway n'existe plus, veuillez en notifier un membre du staff !",
      });
    }

    const winnerMessage = await channel.messages.fetch(doc.winnerMessageId).catch(() => {});
    if (!winnerMessage) {
      return interaction.editReply({
        content:
          "Le message des gagnants du giveaway n'existe plus, veuillez en notifier un membre du staff !",
      });
    }

    const message = await channel.messages.fetch(id).catch(() => {});
    if (!message) {
      return interaction.editReply({
        content: "Le message du giveaway n'existe plus, veuillez en notifier un membre du staff !",
      });
    }

    const winners = selectWinners(doc.participants, doc.winnersCount, guild)
      .map((member) => member.toString())
      .join(", ");

    const oldEmbed = message.embeds[0];
    const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(
      [
        `Fini <t:${Math.floor(doc.endDate.getTime() / 1000)}:R> (<t:${Math.floor(
          doc.endDate.getTime() / 1000
        )}>)`,
        `Hébergé par <@${doc.hostedBy}>`,
        `Participants: **${doc.participants.length}**`,
        `Gagnant${doc.winnersCount > 1 ? "s" : ""} (reroll): ${
          winners.length > 0 ? `${winners}` : "Aucun gagnants."
        }`,
        ``,
      ].join("\n")
    );

    await message.edit({ embeds: [newEmbed] });
    await winnerMessage.edit({
      content:
        winners.length > 0
          ? `Bravo à ${winners} (reroll) ! Vous avez gagnez:\n${doc.description}`
          : "Personne n'a gagné ! 😢",
    });

    return interaction.editReply({
      content: "Le giveaway a bien été reroll !",
    });
  },
};
