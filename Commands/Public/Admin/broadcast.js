const {
  PermissionFlagsBits,
  SlashCommandBuilder,
  EmbedBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputStyle,
} = require("discord.js");

const config = require("../../../config.json");
const { isHighStaff } = require("../../../Functions/roleChecker");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("broadcast")
    .setDescription("Envoie le message des codes promos dans le sallon annonces")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const { guild, options, member } = interaction;

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isHighStaff(member)) {
      return interaction.editReply({ embeds: [nopermissionsEmbed] });
    }

    const broadcastMessage = new TextInputBuilder()
      .setCustomId("broadcast_message_input")
      .setLabel("Entrez votre message : (avec Markdown)")
      .setMaxLength(1000)
      .setMinLength(15)
      .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder().setComponents(broadcastMessage);

    const modal = new ModalBuilder().setCustomId("broadcast_modal").setTitle("Broadcast Message");

    modal.setComponents(actionRow);

    try {
      return await interaction.showModal(modal);
    } catch (error) {
      return console.error(error);
    }
  },
};
