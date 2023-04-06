const { ChatInputCommandInteraction, Client } = require("discord.js");
const { loadCommands } = require("../../../Handlers/commandHandler");

module.exports = {
  subCommand: "reload.commands",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    loadCommands(client);
    interaction.editReply({
      content: "Commandes rechargées",
      ephemeral: true,
    });
  },
};
