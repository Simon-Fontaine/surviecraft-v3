const {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const config = require("../../../config.json");
const { isStaff } = require("../../../Functions/roleChecker.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("space")
    .setDescription("Renvoie un message pour séparer les messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { member, channel } = interaction;

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isStaff(member)) {
      return interaction.reply({ embeds: [nopermissionsEmbed] });
    }

    channel
      .send({
        content: `━━━━━━━━━━━━━━━━━━━━━━━━`,
      })
      .then(() => {
        interaction.reply({ content: "Done !", ephemeral: true });
      });
  },
};
