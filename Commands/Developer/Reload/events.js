const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadEvents } = require("../../../Handlers/eventHandler");

module.exports = {
  subCommand: "reload.events",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    for (const [key, value] of client.events) {
      client.removeListener(`${key}`, value, true);
    }
    loadEvents(client);
    interaction.editReply({
      content: "Événements rechargés",
      ephemeral: true,
    });
  },
};
