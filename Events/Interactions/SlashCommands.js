const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command)
      return interaction.reply({
        content: "Cette commande n'est plus à jour.",
        ephemeral: true,
      });

    if (command.developer && interaction.user.id !== client.config.devID) {
      return interaction.reply({
        content: "Vous ne faites pas partie de l'équipe de développeurs du bot.",
        ephemeral: true,
      });
    }

    try {
      const subCommand = interaction.options.getSubcommand();

      const subCommandFile = client.subCommands.get(`${interaction.commandName}.${subCommand}`);

      if (!subCommandFile)
        return interaction.reply({
          content: "Cette sous-commande n'est plus à jour.",
          ephemeral: true,
        });

      subCommandFile.execute(interaction, client);
    } catch (error) {
      command.execute(interaction, client);
    }
  },
};
