const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Collection,
} = require("discord.js");

const giveawaySchema = require("../../Schemas/Giveaways");

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
  name: "ready",
  once: true,
  execute(client) {
    const check = async () => {
      const endDate = new Date();

      const query = {
        endDate: { $lt: endDate },
        ended: false,
      };

      const giveaways = await giveawaySchema.find(query);

      for (const giveaway of giveaways) {
        const guild = client.guilds.cache.get(giveaway.guildId);
        if (!guild) continue;

        const channel = guild.channels.cache.get(giveaway.channelId);
        if (!channel) continue;

        const message = await channel.messages.fetch(giveaway.messageId).catch(() => {});
        if (!message) continue;

        const winners = selectWinners(giveaway.participants, giveaway.winnersCount, guild)
          .map((member) => member.toString())
          .join(", ");

        const oldEmbed = message.embeds[0];
        const newEmbed = EmbedBuilder.from(oldEmbed)
          .setColor("Red")
          .setDescription(
            [
              `Fini <t:${Math.floor(endDate.getTime() / 1000)}:R> (<t:${Math.floor(
                endDate.getTime() / 1000
              )}>)`,
              `Hébergé par <@${giveaway.hostedBy}>`,
              `Participants: **${giveaway.participants.length}**`,
              `Gagnant${giveaway.winnersCount > 1 ? "s" : ""}: ${
                winners.length > 0 ? `${winners}` : "Aucun gagnants."
              }`,
              ``,
            ].join("\n")
          )
          .setFooter({ text: "Il n'est plus possible de participer" });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Participer")
            .setCustomId(`giveaway-ended`)
            .setEmoji({ name: "🎉" })
            .setDisabled(true)
            .setStyle(ButtonStyle.Secondary)
        );

        await message.edit({ embeds: [newEmbed], components: [row] });

        const winnerMessage = await channel.send({
          content:
            winners.length > 0
              ? `Bravo à ${winners} ! Vous avez gagnez:\n${giveaway.description}`
              : "Personne n'a gagné ! 😢",
          fetchReply: true,
        });

        giveaway.ended = true;
        giveaway.winnerMessageId = winnerMessage.id;
        await giveaway.save();
      }

      setTimeout(check, 1000 * 10);
    };
    check();
  },
};
