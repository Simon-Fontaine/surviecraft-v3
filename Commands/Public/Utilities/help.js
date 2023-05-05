const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Documentation du bot Discord !"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    interaction.reply({
      content: `Voici ma documentation: https://scbots.gitbook.io/surviecraft/`,
      ephemeral: true,
    });
  },
};
