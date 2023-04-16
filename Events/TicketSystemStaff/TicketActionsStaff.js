const { ChatInputCommandInteraction, TextInputStyle, PermissionFlagsBits } = require("discord.js");
const {
  EmbedBuilder,
  UserSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");

const TicketSchema = require("../../Schemas/TicketStaff");
const TicketSetup = require("../../Schemas/TicketSetupStaff");
const config = require("../../config.json");
const { isHighStaff } = require("../../Functions/roleChecker");
const IDs = require("../../ids.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, customId, channel } = interaction;
    const { ManageChannels, SendMessages } = PermissionFlagsBits;
    if (!interaction.isButton()) return;
    if (
      ![
        "ticket-close-staff",
        "ticket-lock-staff",
        "ticket-unlock-staff",
        "ticket-manage-staff",
        "ticket-claim-staff",
      ].includes(customId)
    )
      return;
    const docs = await TicketSetup.findOne({ GuildID: guild.id });
    if (!docs) return;
    const errorEmbed = new EmbedBuilder().setColor(0x00e1ff).setDescription(config.ticketError);
    if (!guild.members.me.permissions.has((r) => r.id === IDs.guideRole))
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch((error) => {
        return;
      });
    const executeEmbed = new EmbedBuilder().setColor(0x00e1ff);
    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);
    const alreadyEmbed = new EmbedBuilder().setColor(0xff7b00);

    const data = await TicketSchema.findOne({ GuildID: guild.id, ChannelID: channel.id });
    if (!data) return;

    guild.members.cache.get(data.MemberID);
    guild.members.cache.get(data.OwnerID);

    if (!isHighStaff(member)) {
      return interaction.reply({ embeds: [nopermissionsEmbed], ephemeral: true }).catch((error) => {
        return;
      });
    }

    switch (customId) {
      case "ticket-close-staff":
        const modal = new ModalBuilder()
          .setCustomId("ticket-staff-close-modal")
          .setTitle("Fermerture du ticket");

        const answerInput = new TextInputBuilder()
          .setCustomId("ticket-staff-close-modal-reason")
          .setLabel("📝 Indiquez une raison")
          .setStyle(TextInputStyle.Short);

        const modalRow = new ActionRowBuilder().setComponents(answerInput);

        modal.setComponents(modalRow);

        try {
          await interaction.showModal(modal);
        } catch (error) {
          console.log(error);
        }

        break;

      case "ticket-lock-staff":
        alreadyEmbed.setDescription(config.ticketAlreadyLocked);
        if (data.Locked == true)
          return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true }).catch((error) => {
            return;
          });
        await TicketSchema.updateOne({ ChannelID: channel.id }, { Locked: true });
        executeEmbed.setDescription(config.ticketSuccessLocked);
        data.MembersID.forEach((m) => {
          channel.permissionOverwrites.edit(m, { SendMessages: false }).catch((error) => {
            return;
          });
        });
        channel.permissionOverwrites.edit(data.OwnerID, { SendMessages: false }).catch((error) => {
          return;
        });
        interaction.deferUpdate().catch((error) => {
          return;
        });
        return interaction.channel.send({ embeds: [executeEmbed] }).catch((error) => {
          return;
        });

      case "ticket-unlock-staff":
        alreadyEmbed.setDescription(config.ticketAlreadyUnlocked);
        if (data.Locked == false)
          return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true }).catch((error) => {
            return;
          });
        await TicketSchema.updateOne({ ChannelID: channel.id }, { Locked: false });
        executeEmbed.setDescription(config.ticketSuccessUnlocked);
        data.MembersID.forEach((m) => {
          channel.permissionOverwrites.edit(m, { SendMessages: true }).catch((error) => {
            return;
          });
        });
        channel.permissionOverwrites.edit(data.OwnerID, { SendMessages: true }).catch((error) => {
          return;
        });
        interaction.deferUpdate().catch((error) => {
          return;
        });
        return interaction.channel.send({ embeds: [executeEmbed] }).catch((error) => {
          return;
        });

      case "ticket-manage-staff":
        const menu = new UserSelectMenuBuilder()
          .setCustomId("ticket-manage-menu-staff")
          .setPlaceholder(config.ticketManageMenuEmoji + config.ticketManageMenuTitle)
          .setMinValues(1)
          .setMaxValues(1);
        return interaction
          .reply({ components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true })
          .catch((error) => {
            return;
          });

      case "ticket-claim-staff":
        alreadyEmbed.setDescription(config.ticketAlreadyClaim + " <@" + data.ModID + ">.");
        if (data.Claimed == true)
          return interaction.reply({ embeds: [alreadyEmbed], ephemeral: true }).catch((error) => {
            return;
          });
        await TicketSchema.updateOne(
          { ChannelID: channel.id },
          { Claimed: true, ModID: member.id, ModTag: member.user.tag }
        );
        let lastinfos = channel;
        await channel
          .edit({
            name: config.ticketClaimEmoji + "・" + lastinfos.name,
            topic: lastinfos.topic + config.ticketDescriptionClaim + " <@" + member.id + ">.",
          })
          .catch((error) => {
            return;
          });
        executeEmbed.setDescription(config.ticketSuccessClaim + " <@" + member.id + ">.");
        interaction.deferUpdate().catch((error) => {
          return;
        });
        interaction.channel.send({ embeds: [executeEmbed] }).catch((error) => {
          return;
        });
        break;
    }
  },
};
