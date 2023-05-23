const {
  EmbedBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputStyle,
} = require("discord.js");
const { isHighStaff } = require("../../../../Functions/roleChecker");
const config = require("../../../../config.json");

module.exports = {
  subCommand: "giveaway.create",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, options, member } = interaction;

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isHighStaff(member)) {
      return interaction.reply({ embeds: [nopermissionsEmbed], ephemeral: true });
    }

    const durationInput = new TextInputBuilder()
      .setCustomId("duration_input")
      .setLabel("Duration")
      .setPlaceholder("Ex: 10 minutes")
      .setStyle(TextInputStyle.Short);

    const numberWinnersInput = new TextInputBuilder()
      .setCustomId("number_winners_input")
      .setLabel("Number of winners")
      .setValue("1")
      .setMaxLength(2)
      .setMinLength(1)
      .setStyle(TextInputStyle.Short);

    const prizeInput = new TextInputBuilder()
      .setCustomId("title_input")
      .setLabel("Title (with markdown)")
      .setMaxLength(256)
      .setStyle(TextInputStyle.Short);

    const descriptionInput = new TextInputBuilder()
      .setCustomId("description_input")
      .setLabel("Description (with markdown)")
      .setMaxLength(1000)
      .setRequired(false)
      .setStyle(TextInputStyle.Paragraph);

    const actionRow = new ActionRowBuilder().setComponents(durationInput);
    const actionRow2 = new ActionRowBuilder().setComponents(numberWinnersInput);
    const actionRow3 = new ActionRowBuilder().setComponents(prizeInput);
    const actionRow4 = new ActionRowBuilder().setComponents(descriptionInput);

    const modal = new ModalBuilder().setCustomId("giveaway_modal").setTitle("Create a Giveaway");

    modal.setComponents(actionRow, actionRow2, actionRow3, actionRow4);

    try {
      return await interaction.showModal(modal);
    } catch (error) {
      return console.error(error);
    }
  },
};
