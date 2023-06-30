const { ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const discordTranscripts = require("discord-html-transcripts");
const dayjs = require("dayjs");

const TicketSchema = require("../../Schemas/Ticket");
const TicketSetup = require("../../Schemas/TicketSetup");
const config = require("../../config.json");
const IDs = require("../../ids.json");
const emojis = require("../../emojis.json");
const { isStaff } = require("../../Functions/roleChecker");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, customId, channel } = interaction;
    const { ViewChannel, SendMessages, ReadMessageHistory } = PermissionFlagsBits;

    if (!interaction.isModalSubmit()) return;

    if (!["ticket-joueur-close-modal"].includes(customId)) return;

    const docs = await TicketSetup.findOne({ GuildID: guild.id });
    if (!docs) return;

    const errorEmbed = new EmbedBuilder().setColor(0x00e1ff).setDescription(config.ticketError);
    if (!guild.members.me.permissions.has((r) => r.id === IDs.guideRole))
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch((error) => {
        return;
      });

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    const data = await TicketSchema.findOne({ GuildID: guild.id, ChannelID: channel.id });
    if (!data) return;

    if (!isStaff(member)) {
      return interaction.reply({ embeds: [nopermissionsEmbed], ephemeral: true }).catch((error) => {
        return;
      });
    }

    const reason = interaction.fields.getTextInputValue("ticket-joueur-close-modal-reason");
    const fileName = `${channel.id}-${Date.now()}.html`;
    const filePath = path.join("/var/www/", fileName);

    const file = await discordTranscripts.createTranscript(channel, {
      returnType: "buffer",
      filename: fileName,
      saveImages: true,
      poweredBy: false,
    });

    fs.writeFile(filePath, file, (err) => {
      if (err) {
        console.error("Error saving HTML file:", err);
        return;
      }
    });

    const fileURL = `https://saves.rubby.app/${fileName}`;

    if (data.ModID === null) {
      data.ModID = "❌";
    }
    if (data.ModTag === null) {
      data.ModTag = "Aucun Attribué";
    }

    const transcriptEmbed = new EmbedBuilder()
      .setColor(0x2f3136)
      .setTitle(`Ticket #${data.TicketID} de ${data.OwnerTag}`)
      .setDescription(
        [
          `${emojis.profile} **Overt Par:** ${data.OwnerTag} [\`${data.OwnerID}\`]`,
          `${emojis.cancel} **Fermé Par:** ${interaction.user.tag} [\`${interaction.user.id}\`]}`,
          `${emojis.moderator} **Modérateur:** ${data.ModTag} [\`${data.ModID}\`]`,
          `${emojis.target} **Détail:**`,
          `${emojis.space}${emojis.doubleRightArrow} Type: \`${data.Type}\``,
          `${emojis.space}${emojis.doubleRightArrow} Overt le: <t:${dayjs(data.createdAt).unix()}>`,
          `${emojis.space}${emojis.doubleRightArrow} Fermer le: <t:${dayjs().unix()}>`,
        ].join("\n")
      )
      .addFields({
        name: `${emojis.reason} Raison:`,
        value: `${reason}`,
      });

    const closingTicket = new EmbedBuilder()
      .setTitle(config.ticketCloseTitle)
      .setDescription(config.ticketCloseDescription)
      .setColor(0x00e1ff);

    await guild.channels.cache
      .get(docs.Transcripts)
      .send({
        content: `${fileURL}`,
        embeds: [transcriptEmbed],
      })
      .catch((error) => {
        return;
      });

    try {
      await interaction.client.users.cache.get(data.OwnerID).send({
        content: `${fileURL}`,
        embeds: [transcriptEmbed],
      });
    } catch {
      await guild.channels.cache
        .get(docs.Transcripts)
        .send({
          content: `**${data.OwnerTag}** [${data.OwnerID}] n'a pas pu être contacté.`,
        })
        .catch((error) => {
          return;
        });
    }

    interaction.deferUpdate().catch((error) => {
      return;
    });

    channel.send({ embeds: [closingTicket] }).catch((error) => {
      return;
    });

    await TicketSchema.findOneAndDelete({ GuildID: guild.id, ChannelID: channel.id });

    setTimeout(() => {
      channel.delete().catch((error) => {
        return;
      });
    }, 5000);
  },
};
