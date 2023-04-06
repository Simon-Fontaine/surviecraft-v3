const { EmbedBuilder } = require("@discordjs/builders");
const { ChatInputCommandInteraction, RESTJSONErrorCodes } = require("discord.js");
const historySchema = require("../../../../Schemas/History.js");
const config = require("../../../../config.json");
const IDs = require("../../../../ids.json");
const emojis = require("../../../../emojis.json");
const { isStaff } = require("../../../../Functions/roleChecker.js");
const dayjs = require("dayjs");

module.exports = {
  subCommand: "timeout.remove",
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

    const targetUser = interaction.options.getUser("user");
    const targetMember = interaction.options.getMember("user");

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

    const reason = interaction.options.getString("reason") || "No reason specified";
    const proof = interaction.options.getAttachment("proof");
    const dm = interaction.options.getBoolean("dm") || false;

    if (!targetMember.isCommunicationDisabled()) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} The user you are targeting is currently not timed out`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    let successfulMuteString = "No users were untimed out!";
    let unsuccessfulMuteString = "All users were untimed out!";

    const caseID = (await historySchema.count()) + 1;

    try {
      await targetMember.timeout(null, `${reason} by ${interaction.user.tag}`).then(async () => {
        await historySchema
          .create({
            case_id: caseID,
            type: "-timeout",
            type_name: `-Timeout`,
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
              `Something went wrong with removing a timeout. \`\`\`${error}\`\`\``
            );
            return await interaction.editReply({ embeds: [failedOperationEmbed] });
          });

        if (dm) {
          const targetEmbed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle(`Your timeout has been removed in ${interaction.guild.name}!`)
            .setDescription(
              [
                `${emojis.reason} **Reason:** ${reason}`,
                `${emojis.moderator} **Moderator:** ${interaction.user.tag}`,
              ].join("\n")
            );
          targetUser.send({ embeds: [targetEmbed] }).catch(() => {});
        }
      });

      successfulMuteString = `${emojis.triangleRight} ${targetUser.tag} [\`${targetUser.id}\`]`;

      const modlogsMuteEmbed = new EmbedBuilder()
        .setColor(0x00eaff)
        .setThumbnail(targetUser.avatarURL({ dynamic: true }) ?? targetUser.defaultAvatarURL)
        .addFields(
          { name: `Case:`, value: `\`${caseID}\` ${emojis.success}`, inline: true },
          { name: `Type:`, value: `\`-Timeout\``, inline: true },
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
      // console.log(error);
      if (error.code === RESTJSONErrorCodes.MissingPermissions) {
        unsuccessfulMuteString = `${emojis.triangleRight} ${targetUser.tag} [\`${targetUser.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Missing Permissions to remove this user timeout`;
      } else {
        unsuccessfulMuteString = `${emojis.triangleRight} ${targetUser.tag} [\`${targetUser.id}\`]\n${emojis.space}${emojis.doubleRightArrow} Unknown Error`;
      }
    }

    const logsMuteEmbed = new EmbedBuilder()
      .setTitle("Timeout Removal result:")
      .setColor(0x2b2d31)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
        ].join("\n")
      )
      .addFields(
        {
          name: `${emojis.success} Successful TO-Removals`,
          value: `${successfulMuteString}`,
          inline: false,
        },
        {
          name: `${emojis.cancel} Unsuccessful TO-Removals`,
          value: `${unsuccessfulMuteString}`,
          inline: false,
        }
      );

    logsChannel.send({ embeds: [logsMuteEmbed] });

    const responseEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle(`Timeout Removal Result:`)
      .setDescription(
        [
          `${emojis.reason} **Reason:** ${reason}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
        ].join("\n")
      );

    if (successfulMuteString === "No users were untimed out!") {
      responseEmbed.addFields({
        name: `${emojis.cancel} Unsuccessful TO-Removals`,
        value: `${unsuccessfulMuteString}`,
        inline: false,
      });
    } else if (unsuccessfulMuteString === "All users were untimed out!") {
      responseEmbed.addFields({
        name: `${emojis.success} Successful TO-Removals`,
        value: `${successfulMuteString}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
  },
};
