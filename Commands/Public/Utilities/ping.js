const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Répond avec la latence aller-retour !"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
      ephemeral: true,
    });
    const ms = sent.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply({
      content: `Latence aller-retour: **${ms}**ms\nWebsocket heartbeat: **${client.ws.ping}**ms`,
      ephemeral: true,
    });
  },
};
