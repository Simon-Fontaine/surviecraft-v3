const { ChatInputCommandInteraction, RESTJSONErrorCodes, EmbedBuilder } = require("discord.js");
const historySchema = require("../../../../Schemas/History.js");
const config = require("../../../../config.json");
const IDs = require("../../../../ids.json");
const emojis = require("../../../../emojis.json");
const { isStaff } = require("../../../../Functions/roleChecker.js");
const dayjs = require("dayjs");

module.exports = {
  subCommand: "ban.add",
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

    const modlogsChannel = interaction.guild.channels.cache.get(IDs.modLogsChannel);
    const logsChannel = interaction.guild.channels.cache.get(IDs.logsChannel);

    const failedOperationEmbed = new EmbedBuilder().setColor(0xf54242);
    const wrongUseEmbed = new EmbedBuilder().setColor(0x00e1ff);

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

    const target = interaction.options.getUser("user");
    const targetMember = interaction.options.getMember("user");

    if (target.id === interaction.user.id) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't target yourself...`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    if (target.id === interaction.client.user.id) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't target me...`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    const reason = interaction.options.getString("reason") || "No reason specified";
    const duration = interaction.options.getString("duration");
    const proof = interaction.options.getAttachment("proof");
    let force = interaction.options.getBoolean("force") || false;
    const soft = interaction.options.getBoolean("soft") || false;
    const purge_days = interaction.options.getInteger("purge_days") || 0;
    const dm = interaction.options.getBoolean("dm") || false;

    let time;
    let timeType;
    let expires;

    if (duration) {
      try {
        const split = duration.match(/\d+|\D+/g);
        time = parseInt(split[0]);
        timeType = split[1].toLowerCase();
      } catch (error) {
        failedOperationEmbed.setDescription(
          [
            `${emojis.cancel} **Unsuccessful Operation!**`,
            `${emojis.space}${emojis.arrowRight} The time you provided is not valid. Try again in this format: 1m / 1h / 1d`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
      }

      if (timeType === "h") {
        time *= 60;
      } else if (timeType === "d") {
        time *= 60 * 24;
      } else if (timeType !== "m") {
        failedOperationEmbed.setDescription(
          [
            `${emojis.cancel} **Unsuccessful Operation!**`,
            `${emojis.space}${emojis.arrowRight} The time you provided is not valid. Try again in this format: 1m / 1h / 1d`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
      }

      expires = new Date();
      expires.setMinutes(expires.getMinutes() + time);
    }

    let successfulBanString = "No users were banned!";
    let unsuccessfulBanString = "All users were banned!";

    const caseID = (await historySchema.count()) + 1;

    const isBan = await interaction.guild.bans.fetch(target).catch(() => {});

    if (targetMember && force) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't force ban someone that currently exists in your server.`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    } else if (!targetMember && !force) {
      force = true;
    }

    const type = soft
      ? `Soft-Ban${duration ? ` (${duration})` : ""}`
      : force
      ? `Force-Ban${duration ? ` (${duration})` : ""}`
      : `Ban${duration ? ` (${duration})` : ""}`;

    if (isBan) {
      unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} User is already banned`;
    } else {
      if (force && soft) {
        wrongUseEmbed.setDescription(
          [
            `${emojis.triangleRight} **Wrong Use!**`,
            `${emojis.space}${emojis.arrowRight} You can't both soft and force ban a user!`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [wrongUseEmbed], ephemeral: true });
      }

      if (force) {
        if (dm) {
          wrongUseEmbed.setDescription(
            [
              `${emojis.triangleRight} **Wrong Use!**`,
              `${emojis.space}${emojis.arrowRight} You can't force ban and DM a foreign user!`,
            ].join("\n")
          );
          return await interaction.editReply({ embeds: [wrongUseEmbed], ephemeral: true });
        }

        try {
          await interaction.guild.bans
            .create(target, {
              deleteMessageSeconds: purge_days * 86400,
              reason: `${reason} by ${interaction.user.tag}${duration ? ` for ${duration}` : ""}`,
            })
            .then(async () => {
              await historySchema
                .create({
                  case_id: caseID,
                  type: "+ban",
                  type_name: `${type}`,
                  user_tag: `${target.tag}`,
                  user_id: `${target.id}`,
                  user_avatar: `${target.avatarURL({ dynamic: true }) ?? target.defaultAvatarURL}`,
                  mod_tag: `${interaction.user.tag}`,
                  mod_id: `${interaction.user.id}`,
                  reason: `${reason}`,
                  msg_id: ``,
                  guild_id: `${interaction.guild.id}`,
                  unix_time: `${dayjs().unix()}`,
                  format_time: `${dayjs().format("MMM D[,] YYYY H[:]mm A")}`,
                  expires: expires,
                  duration: `${duration}`,
                })
                .catch(async (error) => {
                  failedOperationEmbed.setDescription(
                    `Something went wrong with adding a unban. \`\`\`${error}\`\`\``
                  );
                  return await interaction.editReply({ embeds: [failedOperationEmbed] });
                });
            });
          successfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]`;

          const modlogsBanEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setThumbnail(target.avatarURL({ dynamic: true }) ?? target.defaultAvatarURL)
            .addFields(
              { name: `Case:`, value: `\`${caseID}\` ${emojis.success}`, inline: true },
              { name: `Type:`, value: `\`${type}\``, inline: true },
              {
                name: `Moderator:`,
                value: `\`${interaction.user.tag}\` ${emojis.moderator}`,
                inline: true,
              },
              {
                name: `Target:`,
                value: `${emojis.triangleRight} \`${target.tag}\` ${emojis.target}`,
              },
              { name: `Reason:`, value: `${reason}` }
            )
            .setFooter({ text: dayjs().format("MMM D[,] YYYY H[:]mm A") });

          if (proof) {
            const sent = await modlogsChannel.send({
              embeds: [modlogsBanEmbed],
              files: [proof],
              fetchReply: true,
            });
            await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
          } else {
            const sent = await modlogsChannel.send({
              embeds: [modlogsBanEmbed],
              fetchReply: true,
            });
            await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
          }
        } catch (error) {
          if (error.code === RESTJSONErrorCodes.UserBannedFromThisGuild) {
            unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} User is already banned`;
          } else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
            unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Missing Permissions to ban this user`;
          } else {
            unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Unknown Error`;
          }
        }
      } else {
        try {
          if (dm && targetMember.bannable) {
            const targetEmbed = new EmbedBuilder()
              .setColor(0x2b2d31)
              .setTitle(
                `You have been banned from ${interaction.guild.name}${
                  duration ? ` for ${duration}` : ""
                }!`
              )
              .setDescription(
                [
                  `${emojis.reason} **Reason:** ${reason}`,
                  `${emojis.moderator} **Moderator:** ${interaction.user.tag}`,
                ].join("\n")
              );
            target.send({ embeds: [targetEmbed] }).catch(() => {});
          }
          await interaction.guild.bans
            .create(target, {
              deleteMessageSeconds: purge_days * 86400,
              reason: `${reason} by ${interaction.user.tag}${duration ? ` for ${duration}` : ""}`,
            })
            .then(async () => {
              await historySchema
                .create({
                  case_id: caseID,
                  type: "+ban",
                  type_name: `${type}`,
                  user_tag: `${target.tag}`,
                  user_id: `${target.id}`,
                  user_avatar: `${target.avatarURL({ dynamic: true }) ?? target.defaultAvatarURL}`,
                  mod_tag: `${interaction.user.tag}`,
                  mod_id: `${interaction.user.id}`,
                  reason: `${reason}`,
                  msg_id: ``,
                  guild_id: `${interaction.guild.id}`,
                  unix_time: `${dayjs().unix()}`,
                  format_time: `${dayjs().format("MMM D[,] YYYY H[:]mm A")}`,
                  expires: expires,
                  duration: `${duration}`,
                })
                .catch(async (error) => {
                  failedOperationEmbed.setDescription(
                    `Something went wrong with adding a unban. \`\`\`${error}\`\`\``
                  );
                  return await interaction.editReply({ embeds: [failedOperationEmbed] });
                });
            });
          successfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]`;
          if (soft) {
            await interaction.guild.bans
              .remove(target, { reason: `Soft-Ban by ${interaction.user.tag}` })
              .catch(() => {});

            await historySchema.findOneAndUpdate(
              { case_id: caseID, type: "+ban", unbanned: false },
              { unbanned: true }
            );
          }

          const modlogsBanEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setThumbnail(target.avatarURL({ dynamic: true }) ?? target.defaultAvatarURL)
            .addFields(
              { name: `Case:`, value: `\`${caseID}\` ${emojis.success}`, inline: true },
              { name: `Type:`, value: `\`${type}\``, inline: true },
              {
                name: `Moderator:`,
                value: `\`${interaction.user.tag}\` ${emojis.moderator}`,
                inline: true,
              },
              {
                name: `Target:`,
                value: `${emojis.triangleRight} \`${target.tag}\` ${emojis.target}`,
              },
              { name: `Reason:`, value: `${reason}` }
            )
            .setFooter({ text: dayjs().format("MMM D[,] YYYY H[:]mm A") });

          if (proof) {
            const sent = await modlogsChannel.send({
              embeds: [modlogsBanEmbed],
              files: [proof],
              fetchReply: true,
            });
            await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
          } else {
            const sent = await modlogsChannel.send({
              embeds: [modlogsBanEmbed],
              fetchReply: true,
            });
            await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
          }
        } catch (error) {
          if (error.code === RESTJSONErrorCodes.UserBannedFromThisGuild) {
            unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} User is already banned`;
          } else if (error.code === RESTJSONErrorCodes.MissingPermissions) {
            unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Missing Permissions to ban this user`;
          } else {
            unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Unknown Error`;
          }
        }
      }
    }

    const logsBanEmbed = new EmbedBuilder()
      .setTitle("Ban result:")
      .setColor(0x2b2d31)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
          `${emojis.target} **Details:**`,
          `${emojis.space}${emojis.doubleRightArrow} Duration: ${
            duration ? `\`${duration}\` ` : ""
          }${duration ? emojis.success : emojis.cancel}`,
          `${emojis.space}${emojis.doubleRightArrow} Soft Ban: ${
            soft ? emojis.success : emojis.cancel
          }`,
          `${emojis.space}${emojis.doubleRightArrow} Force Ban: ${
            force ? emojis.success : emojis.cancel
          }`,
          `${emojis.space}${emojis.doubleRightArrow} DM Members: ${
            dm ? emojis.success : emojis.cancel
          }`,
        ].join("\n")
      )
      .addFields(
        {
          name: `${emojis.success} Successful bans`,
          value: `${successfulBanString}`,
          inline: false,
        },
        {
          name: `${emojis.cancel} Unsuccessful bans`,
          value: `${unsuccessfulBanString}`,
          inline: false,
        }
      );

    logsChannel.send({ embeds: [logsBanEmbed] });

    let descriptionString = [
      `${emojis.reason} **Reason:** ${reason}`,
      `${emojis.moderator} **Moderator:** ${interaction.user}`,
    ].join("\n");

    if (duration) {
      descriptionString += `\n${emojis.duration} **Duration:** \`${duration}\` ${emojis.success}`;
    }

    const responseEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(`${type} result:`)
      .setDescription(descriptionString);

    if (successfulBanString === "No users were banned!") {
      responseEmbed.addFields({
        name: `${emojis.cancel} Unsuccessful bans`,
        value: `${unsuccessfulBanString}`,
        inline: false,
      });
    } else if (unsuccessfulBanString === "All users were banned!") {
      responseEmbed.addFields({
        name: `${emojis.success} Successful bans`,
        value: `${successfulBanString}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
  },
};
