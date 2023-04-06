const { EmbedBuilder } = require("@discordjs/builders");
const { Message, RESTJSONErrorCodes } = require("discord.js");
const userAutoModerationSchema = require("../../Schemas/AutoModeration");
const historySchema = require("../../Schemas/History.js");
const config = require("../../config.json");
const IDs = require("../../ids.json");
const emojis = require("../../emojis.json");
const { isHighStaff } = require("../../Functions/roleChecker.js");
const dayjs = require("dayjs");

module.exports = {
  name: "messageCreate",
  /**
   *
   * @param {Message} message
   */
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;
    if (isHighStaff(message.member)) return;

    const links = ["discord.gg/", "discord.com/invite/"];
    const forbiddenLinks = ["discord.io/", "youtube.com/", "youtu.be/"];
    forbiddenLinks.forEach((link) => {
      if (message.channel.id === IDs.commandChannel) return;
      if (message.channel.id === IDs.imageVideoChannel) return;
      if (message.channel.parentId === IDs.infoCategory) return;
      if (message.channel.parentId === IDs.archiveCategory) return;
      if (message.channel.parentId === IDs.ticketCategory) return;
      if (message.content.includes(link)) return deleteMessage();
    });

    for (const link of links) {
      if (message.channel.parentId === IDs.infoCategory) return;
      if (message.channel.parentId === IDs.archiveCategory) return;
      if (message.channel.parentId === IDs.ticketCategory) return;
      if (!message.content.includes(link)) return;
      const code = message.content.split(link)[1].split(" ")[0];
      const isGuildInvite = message.guild.invites.cache.has(code);
      if (!isGuildInvite) {
        try {
          const vanity = await message.guild.fetchVanityData();
          if (code !== vanity.code) return deleteMessage();
        } catch (err) {
          deleteMessage();
        }
      }
    }

    async function deleteMessage() {
      message.channel
        .send({
          content: `${message.author} veuillez ne pas envoyer de liens interdits (3 avertissements = sanctions) !`,
        })
        .then((msg) => {
          setTimeout(() => msg.delete().catch(() => {}), 10000);
        });
      message.delete().catch(() => {});

      let userAutoModeration = await userAutoModerationSchema.findOne({
        guild_id: message.guild.id,
        user_id: message.author.id,
      });

      if (!userAutoModeration) {
        userAutoModeration = await userAutoModerationSchema.create({
          guild_id: message.guild.id,
          user_id: message.author.id,
        });
      }

      userAutoModeration.number_of_actions += 1;
      userAutoModeration.save();

      const modlogsChannel = message.guild.channels.cache.get(IDs.modLogsChannel);
      const logsChannel = message.guild.channels.cache.get(IDs.logsChannel);

      if (userAutoModeration.number_of_actions >= 3) {
        if (message.member.isCommunicationDisabled()) {
          return;
        }

        const reason = `auto-modération: ${userAutoModeration.number_of_actions} liens interdits (limite 3)`;
        const time = (userAutoModeration.number_of_actions - 2) * 5 * 60 * 1000;

        let successfulMuteString = "No users were timed out!";
        let unsuccessfulMuteString = "All users were timed out!";

        let dm;
        let hasBeenDm;

        const caseID = (await historySchema.count()) + 1;

        try {
          await message.member.timeout(time, reason).then(async () => {
            await historySchema.create({
              case_id: caseID,
              type: "+timeout",
              type_name: `+Timeout (${time / 1000 / 60}m)`,
              user_tag: `${message.author.tag}`,
              user_id: `${message.author.id}`,
              user_avatar: `${
                message.author.avatarURL({ dynamic: true }) ?? message.author.defaultAvatarURL
              }`,
              mod_tag: `${client.user.tag}`,
              mod_id: `${client.user.id}`,
              reason: `${reason}`,
              msg_id: ``,
              guild_id: `${message.guild.id}`,
              unix_time: `${dayjs().unix()}`,
              format_time: `${dayjs().format("MMM D[,] YYYY H[:]mm A")}`,
              duration: `${time / 1000 / 60}m`,
            });
          });

          const modlogsMuteEmbed = new EmbedBuilder()
            .setColor(0x0008ff)
            .setThumbnail(
              message.author.avatarURL({ dynamic: true }) ?? message.author.defaultAvatarURL
            )
            .addFields(
              { name: `Case:`, value: `\`${caseID}\` ${emojis.success}`, inline: true },
              { name: `Type:`, value: `\`+Timeout (${time / 1000 / 60}m)\``, inline: true },
              {
                name: `Moderator:`,
                value: `\`${client.user.tag}\` ${emojis.moderator}`,
                inline: true,
              },
              {
                name: `Target:`,
                value: `${emojis.triangleRight} \`${message.author.tag}\` ${emojis.target}`,
              },
              { name: `Reason:`, value: `${reason}` }
            )
            .setFooter({ text: dayjs().format("MMM D[,] YYYY H[:]mm A") });

          const sent = await modlogsChannel.send({ embeds: [modlogsMuteEmbed], fetchReply: true });
          await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });

          successfulMuteString = `${emojis.triangleRight} ${message.author.tag} [\`${message.author.id}\`]`;
          dm = true;
        } catch (error) {
          if (error.code === RESTJSONErrorCodes.MissingPermissions) {
            unsuccessfulMuteString = `${emojis.triangleRight} ${message.author.tag} [\`${message.author.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Missing Permissions to timeout this user`;
          } else {
            unsuccessfulMuteString = `${emojis.triangleRight} ${message.author.tag} [\`${message.author.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Unknown Error`;
          }
          dm = false;
        }

        if (dm) {
          try {
            const targetEmbed = new EmbedBuilder()
              .setColor(0x2b2d31)
              .setTitle(
                `You have been timed out in ${message.guild.name} for ${time / 1000 / 60} minutes!`
              )
              .setDescription(
                [
                  `${emojis.reason} **Reason:** ${reason}`,
                  `${emojis.moderator} **Moderator:** ${client.user.tag}`,
                ].join("\n")
              );
            message.author.send({ embeds: [targetEmbed] });
            hasBeenDm = true;
          } catch (error) {
            hasBeenDm = false;
          }
        }

        const logsMuteEmbed = new EmbedBuilder()
          .setTitle("Auto-Moderation result:")
          .setColor(0x2b2d31)
          .setDescription(
            [
              `${emojis.reason} **Reason:** ${reason}`,
              `${emojis.moderator} **Moderator:** ${client.user}`,
              `${emojis.target} **Details:**`,
              `${emojis.space}${emojis.doubleRightArrow} Duration: ${time / 1000 / 60} minutes`,
              `${emojis.space}${emojis.doubleRightArrow} DM Members: ${
                hasBeenDm ? emojis.success : emojis.cancel
              }`,
            ].join("\n")
          )
          .addFields(
            {
              name: `${emojis.success} Successful timeouts`,
              value: `${successfulMuteString}`,
              inline: false,
            },
            {
              name: `${emojis.cancel} Unsuccessful timeouts`,
              value: `${unsuccessfulMuteString}`,
              inline: false,
            }
          );

        logsChannel.send({ embeds: [logsMuteEmbed] });
      }
    }
  },
};
