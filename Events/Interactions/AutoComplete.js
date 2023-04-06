const { AutocompleteInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {AutocompleteInteraction} interaction
   */
  async execute(interaction, client) {
    if (!interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  },
};
