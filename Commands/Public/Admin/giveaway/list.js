const {
  EmbedBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputStyle,
} = require("discord.js");
const giveawaySchema = require("../../../../Schemas/Giveaways");

module.exports = {
  subCommand: "giveaway.list",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options, member } = interaction;
    await interaction.deferReply({ ephemeral: true });

    const giveaways = await giveawaySchema.find({ guildId: guild.id });

    let giveawaysList = "";

    for (const giveaway of giveaways) {
      const channel = guild.channels.cache.get(giveaway.channelId);
      if (!channel) continue;

      const message = await channel.messages.fetch(giveaway.messageId).catch(() => {});
      if (!message) continue;

      giveawaysList += `**${giveaway.title}**\n[\`${giveaway.messageId}\`](${message.url}) | ${
        message.url
      }\nCréé par <@${giveaway.hostedBy}> | Statut: ${
        giveaway.ended ? `\`🔴 Terminé\`` : `\`🟢 En cours\``
      }\n\n`;
    }

    if (!giveawaysList) {
      return interaction.editReply({
        content: "Il n'y a pas de giveaway dans cette base de donnée !",
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#2b2d31")
      .setTitle(`Giveaway ${guild.name}`)
      .setDescription(giveawaysList);

    return interaction.editReply({ embeds: [embed] });
  },
};
