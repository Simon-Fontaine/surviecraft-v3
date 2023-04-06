const { ChatInputCommandInteraction, TextInputStyle, PermissionFlagsBits } = require("discord.js");
const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");

const TicketSchema = require("../../Schemas/Ticket");
const TicketSetup = require("../../Schemas/TicketSetup");
const config = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, customId, channel } = interaction;

    if (!interaction.isStringSelectMenu()) return;

    if (customId !== "ticket_joueur_select") return;

    const interactionValue = interaction.values[0];

    if (
      ![
        "Problème Mot De Passe",
        "Problème En Jeu",
        "Problème Site Web",
        "Problème Discord",
      ].includes(interactionValue)
    ) {
      return interaction.reply({
        content: `Votre choix d'option a été remis à zéro.`,
        ephemeral: true,
      });
    }

    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (!data) return;

    const findTicket = await TicketSchema.findOne({ GuildID: guild.id, OwnerID: member.id });

    if (findTicket) {
      return interaction
        .reply({ content: config.ticketAlreadyExist, ephemeral: true })
        .catch((error) => {
          return;
        });
    }
    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction
        .reply({ content: "Désolé, je n'ai pas les permissions nécessaires.", ephemeral: true })
        .catch((error) => {
          return;
        });
    }

    const modal = new ModalBuilder().setCustomId(interactionValue).setTitle(interactionValue);

    let usernameInput;

    if (interactionValue === "Problème Site Web") {
      usernameInput = new TextInputBuilder()
        .setCustomId("username_input")
        .setLabel("L'addresse E-Mail associée au compte boutique")
        .setPlaceholder("votrenom@email.com")
        .setMaxLength(100)
        .setStyle(TextInputStyle.Short);
    } else {
      usernameInput = new TextInputBuilder()
        .setCustomId("username_input")
        .setLabel("Votre pseudo Minecraft EXACT")
        .setPlaceholder('ex: "H3st1a"')
        .setMaxLength(16)
        .setMinLength(3)
        .setStyle(TextInputStyle.Short);
    }

    const questionInput = new TextInputBuilder()
      .setCustomId("question_input")
      .setLabel("Décrivez PRÉCISÉMENT votre problème")
      .setMaxLength(1000)
      .setMinLength(15)
      .setStyle(TextInputStyle.Paragraph);

    const ipInput = new TextInputBuilder()
      .setCustomId("ip_input")
      .setLabel("Votre IP via https://www.monip.org/")
      .setMaxLength(15)
      .setMinLength(7)
      .setPlaceholder('ex: "123.456.789.012"')
      .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().setComponents(usernameInput);
    const secondActionRow = new ActionRowBuilder().setComponents(questionInput);
    const thirdActionRow = new ActionRowBuilder().setComponents(ipInput);

    if (interactionValue === "Problème Discord") {
      modal.setComponents(secondActionRow);
    } else if (interactionValue === "Problème Mot De Passe") {
      modal.setComponents(firstActionRow, thirdActionRow, secondActionRow);
    } else {
      modal.setComponents(firstActionRow, secondActionRow);
    }

    try {
      return await interaction.showModal(modal);
    } catch (error) {
      return console.log(error);
    }
  },
};
