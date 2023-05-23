const {
  EmbedBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputStyle,
} = require("discord.js");
const giveawaySchema = require("../../../../Schemas/Giveaways");
const { isHighStaff } = require("../../../../Functions/roleChecker");
const config = require("../../../../config.json");

module.exports = {
  subCommand: "giveaway.delete",
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

    const doc = await giveawaySchema.findOneAndDelete({ guildId: guild.id, messageId: id });

    if (!doc) {
      return interaction.editReply({
        content: "Ce giveaway n'existe pas, veuillez essayez avec un autre ID !",
      });
    } else {
      const channel = guild.channels.cache.get(doc.channelId);
      if (!channel) {
        console.log("channel not found");
        return interaction.editReply({
          content: "Le giveaway a bien été supprimé de la base de donnée !",
        });
      }

      const message = await channel.messages.fetch(id).catch(() => {});
      if (!message) {
        console.log("message not found");
        return interaction.editReply({
          content: "Le giveaway a bien été supprimé de la base de donnée !",
        });
      }

      const winnerMessage = await channel.messages.fetch(doc.winnerMessageId).catch(() => {});
      if (!winnerMessage) {
        console.log("winner message not found");
        return interaction.editReply({
          content: "Le giveaway a bien été supprimé de la base de donnée !",
        });
      }

      try {
        await message.delete().catch(() => {});
      } catch (ignored) {}
      try {
        await winnerMessage.delete();
      } catch (ignored) {}

      return interaction.editReply({
        content: "Le giveaway a bien été supprimé de la base de donnée ainsi que son message !",
      });
    }
  },
};
