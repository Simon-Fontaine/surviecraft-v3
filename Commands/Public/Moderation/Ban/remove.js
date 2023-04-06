const { EmbedBuilder } = require("@discordjs/builders");
const { ChatInputCommandInteraction, RESTJSONErrorCodes } = require("discord.js");
const historySchema = require("../../../../Schemas/History.js");
const config = require("../../../../config.json");
const IDs = require("../../../../ids.json");
const emojis = require("../../../../emojis.json");
const { isStaff } = require("../../../../Functions/roleChecker.js");
const dayjs = require("dayjs");

module.exports = {
  subCommand: "ban.remove",
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
    const proof = interaction.options.getAttachment("proof");

    let successfulBanString = "No users were unbanned!";
    let unsuccessfulBanString = "All users were unbanned!";

    const caseID = (await historySchema.count()) + 1;

    const type = "Unban";

    const isMember = await interaction.guild.members.fetch(target).catch(() => {});

    if (isMember) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't target a guild member!`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    const isBan = await interaction.guild.bans.fetch(target).catch(() => {});

    if (!isBan) {
      unsuccessfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]\n${emojis.space}${emojis.doubleRightArrow} User is not banned`;
    } else {
      successfulBanString = `${emojis.triangleRight} ${target.tag} [\`${target.id}\`]`;

      await interaction.guild.bans.remove(target, {
        reason: `Unban by ${interaction.user.tag} for ${reason}`,
      });

      await historySchema
        .create({
          case_id: caseID,
          type: "-ban",
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
          unbanned: true,
        })
        .catch(async (error) => {
          failedOperationEmbed.setDescription(
            `Something went wrong with adding a unban. \`\`\`${error}\`\`\``
          );
          return await interaction.editReply({ embeds: [failedOperationEmbed] });
        });

      const modlogsBanEmbed = new EmbedBuilder()
        .setColor(0xff6a00)
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
        const sent = await modlogsChannel.send({ embeds: [modlogsBanEmbed], fetchReply: true });
        await historySchema.findOneAndUpdate({ case_id: caseID }, { msg_id: sent.id });
      }
    }

    const logsBanEmbed = new EmbedBuilder()
      .setTitle("Unban result:")
      .setColor(0x2b2d31)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
        ].join("\n")
      )
      .addFields(
        {
          name: `${emojis.success} Successful unbans`,
          value: `${successfulBanString}`,
          inline: false,
        },
        {
          name: `${emojis.cancel} Unsuccessful unbans`,
          value: `${unsuccessfulBanString}`,
          inline: false,
        }
      );

    logsChannel.send({ embeds: [logsBanEmbed] });

    const responseEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(`${type} result:`)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
        ].join("\n")
      );

    if (successfulBanString === "No users were unbanned!") {
      responseEmbed.addFields({
        name: `${emojis.cancel} Unsuccessful unbans`,
        value: `${unsuccessfulBanString}`,
        inline: false,
      });
    } else if (unsuccessfulBanString === "All users were unbanned!") {
      responseEmbed.addFields({
        name: `${emojis.success} Successful unbans`,
        value: `${successfulBanString}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
  },
};
