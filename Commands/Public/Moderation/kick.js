const {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  RESTJSONErrorCodes,
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
    .setName("kick")
    .setDescription("Kick un membre de votre serveur")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Mention de l'utilisateur que vous souhaitez kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("La raison du kick")
        .setMaxLength(300)
        .setRequired(false)
    )
    .addAttachmentOption((option) =>
      option.setName("proof").setDescription("Ajouter une pièce jointe").setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName("dm").setDescription("DM l'utilisateur au moment du kick").setRequired(false)
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

    const targetUser = interaction.options.getUser("user");
    const targetMember = interaction.options.getMember("user");
    const reason = interaction.options.getString("reason") || "No reason specified";
    const proof = interaction.options.getAttachment("proof");
    const dm = interaction.options.getBoolean("dm") || false;

    const modlogsChannel = interaction.guild.channels.cache.get(IDs.modLogsChannel);
    const logsChannel = interaction.guild.channels.cache.get(IDs.logsChannel);

    const failedOperationEmbed = new EmbedBuilder().setColor(0xf54242);

    let successfulMuteString = "No users were kicked!";
    let unsuccessfulMuteString = "All users were kicked!";

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

    if (targetUser.id === interaction.user.id) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't target yourself...`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    if (targetUser.id === interaction.client.user.id) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't target me...`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    if (!targetMember) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} The user you provided is not a server member.`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    const caseID = (await historySchema.count()) + 1;

    try {
      if (targetMember.kickable && dm) {
        const targetEmbed = new EmbedBuilder()
          .setColor(0x2b2d31)
          .setTitle(`You have been kicked from ${interaction.guild.name}!`)
          .setDescription(
            [
              `${emojis.reason} **Reason:** ${reason}`,
              `${emojis.moderator} **Moderator:** ${interaction.user.tag}`,
            ].join("\n")
          );
        targetUser.send({ embeds: [targetEmbed] }).catch(() => {});
      }
      await targetMember.kick(`${reason} by ${interaction.user.tag}`).then(async () => {
        await historySchema
          .create({
            case_id: caseID,
            type: "+kick",
            type_name: `Kick`,
            user_tag: `${targetUser.tag}`,
            user_id: `${targetUser.id}`,
            user_avatar: `${
              targetUser.avatarURL({ dynamic: true }) ?? targetUser.defaultAvatarURL
            }`,
            mod_tag: `${interaction.user.tag}`,
            mod_id: `${interaction.user.id}`,
            reason: `${reason}`,
            msg_id: ``,
            guild_id: `${interaction.guild.id}`,
            unix_time: `${dayjs().unix()}`,
            format_time: `${dayjs().format("MMM D[,] YYYY H[:]mm A")}`,
          })
          .catch(async (error) => {
            failedOperationEmbed.setDescription(
              `Something went wrong with adding a kick. \`\`\`${error}\`\`\``
            );
            return await interaction.editReply({ embeds: [failedOperationEmbed] });
          });
      });

      successfulMuteString = `${emojis.triangleRight} ${targetUser.tag} [\`${targetUser.id}\`]`;

      const modlogsMuteEmbed = new EmbedBuilder()
        .setColor(0xffc400)
        .setThumbnail(targetUser.avatarURL({ dynamic: true }) ?? targetUser.defaultAvatarURL)
        .addFields(
          { name: `Case:`, value: `\`${caseID}\` ${emojis.success}`, inline: true },
          { name: `Type:`, value: `\`Kick\``, inline: true },
          {
            name: `Moderator:`,
            value: `\`${interaction.user.tag}\` ${emojis.moderator}`,
            inline: true,
          },
          {
            name: `Target:`,
            value: `${emojis.triangleRight} \`${targetUser.tag}\` ${emojis.target}`,
          },
          { name: `Reason:`, value: `${reason}` }
        )
        .setFooter({ text: dayjs().format("MMM D[,] YYYY H[:]mm A") });

      if (proof) {
        const sent = await modlogsChannel.send({
          embeds: [modlogsMuteEmbed],
          files: [proof],
          fetchReply: true,
        });
        await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
      } else {
        const sent = await modlogsChannel.send({ embeds: [modlogsMuteEmbed], fetchReply: true });
        await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
      }
    } catch (error) {
      if (error.code === RESTJSONErrorCodes.MissingPermissions) {
        unsuccessfulMuteString = `${emojis.triangleRight} ${targetUser.tag} [\`${targetUser.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Missing Permissions to kick this user`;
      } else {
        unsuccessfulMuteString = `${emojis.triangleRight} ${targetUser.tag} [\`${targetUser.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Unknown Error`;
      }
    }

    const logsMuteEmbed = new EmbedBuilder()
      .setTitle("Kick result:")
      .setColor(0x2b2d31)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
          `${emojis.target} **Details:**`,
          `${emojis.space}${emojis.doubleRightArrow} DM Members: ${
            dm ? emojis.success : emojis.cancel
          }`,
        ].join("\n")
      )
      .addFields(
        {
          name: `${emojis.success} Successful kicks`,
          value: `${successfulMuteString}`,
          inline: false,
        },
        {
          name: `${emojis.cancel} Unsuccessful kicks`,
          value: `${unsuccessfulMuteString}`,
          inline: false,
        }
      );

    logsChannel.send({ embeds: [logsMuteEmbed] });

    const responseEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(`Kick result:`)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
        ].join("\n")
      );

    if (successfulMuteString === "No users were kicked!") {
      responseEmbed.addFields({
        name: `${emojis.cancel} Unsuccessful kicks`,
        value: `${unsuccessfulMuteString}`,
        inline: false,
      });
    } else if (unsuccessfulMuteString === "All users were kicked!") {
      responseEmbed.addFields({
        name: `${emojis.success} Successful kicks`,
        value: `${successfulMuteString}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
  },
};
