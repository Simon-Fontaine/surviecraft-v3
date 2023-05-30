const {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const historySchema = require("../../../Schemas/History.js");
const config = require("../../../config.json");
const IDs = require("../../../ids.json");
const emojis = require("../../../emojis.json");
const { isStaff } = require("../../../Functions/roleChecker.js");
const dayjs = require("dayjs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Avertir un membre de votre serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Mention de l'utilisateur que vous souhaitez avertir")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("La raison de l'ajout ce warn")
        .setMaxLength(300)
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option.setName("proof").setDescription("Ajouter une pièce jointe").setRequired(false)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isStaff(interaction.member)) {
      return interaction.editReply({ embeds: [nopermissionsEmbed] });
    }

    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const proof = interaction.options.getAttachment("proof");

    const modlogsChannel = interaction.guild.channels.cache.get(IDs.modLogsChannel);
    const logsChannel = interaction.guild.channels.cache.get(IDs.logsChannel);

    const failedOperationEmbed = new EmbedBuilder().setColor(0xf54242);

    if (!modlogsChannel) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} The modlogs channel does not exist.`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    if (!logsChannel) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} The logs channel does not exist.`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't warn yourself...`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't warn me...`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    const caseID = (await historySchema.count()) + 1;

    try {
      await historySchema.create({
        case_id: caseID,
        type: "+warn",
        type_name: "+Warn",
        user_tag: `${target.tag}`,
        user_id: `${target.id}`,
        user_avatar: `${target.avatarURL({ dynamic: true }) ?? target.defaultAvatarURL}`,
        mod_tag: `${interaction.user.tag}`,
        mod_id: `${interaction.user.id}`,
        msg_id: ``,
        guild_id: `${interaction.guild.id}`,
        unix_time: `${dayjs().unix()}`,
        format_time: `${dayjs().format("MMM D[,] YYYY H[:]mm A")}`,
        reason: `${reason}`,
      });

      const modLogsEmbed = new EmbedBuilder()
        .setColor(0x8400ff)
        .setThumbnail(target.avatarURL({ dynamic: true }) ?? target.defaultAvatarURL)
        .addFields(
          { name: `Case:`, value: `\`${caseID}\` ${emojis.success}`, inline: true },
          { name: `Type:`, value: `\`Warn\``, inline: true },
          {
            name: `Moderator:`,
            value: `\`${interaction.user.tag}\` ${emojis.moderator}`,
            inline: true,
          },
          { name: `Target:`, value: `${emojis.triangleRight} \`${target.tag}\` ${emojis.target}` },
          { name: `Reason:`, value: `${reason}` }
        )
        .setFooter({ text: dayjs().format("MMM D[,] YYYY H[:]mm A") });

      if (proof) {
        const sent = await modlogsChannel.send({
          embeds: [modLogsEmbed],
          files: [proof],
          fetchReply: true,
        });
        await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
      } else {
        const sent = await modlogsChannel.send({ embeds: [modLogsEmbed], fetchReply: true });
        await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
      }

      const targetEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle(`You have been warned in ${interaction.guild.name}!`)
        .setDescription(
          [
            `${emojis.reason} **Reason:** ${reason}`,
            `${emojis.moderator} **Moderator:** ${interaction.user.tag}`,
          ].join("\n")
        );

      target.send({ embeds: [targetEmbed] }).catch(() => {});

      const successEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle("Warn result:")
        .setDescription(
          [
            `${emojis.reason} **Reason:** ${reason}`,
            `${emojis.moderator} **Moderator:** ${interaction.user}`,
          ].join("\n")
        )
        .addFields({
          name: "Warned:",
          value: `${emojis.space}${emojis.success}${target.tag} [\`${target.id}\`]`,
        });

      logsChannel.send({ embeds: [successEmbed] });
      return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      console.log(error);
      failedOperationEmbed.setDescription(
        `Something went wrong with adding a warn. \`\`\`${error}\`\`\``
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed] });
    }
  },
};
