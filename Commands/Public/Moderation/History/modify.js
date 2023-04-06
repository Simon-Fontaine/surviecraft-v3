const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const historySchema = require("../../../../Schemas/History.js");
const config = require("../../../../config.json");
const IDs = require("../../../../ids.json");
const emojis = require("../../../../emojis.json");
const { isStaff } = require("../../../../Functions/roleChecker.js");

module.exports = {
  subCommand: "history.modify",
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

    const caseID = interaction.options.getInteger("case");
    const reason = interaction.options.getString("reason");
    const state = interaction.options.getBoolean("state");

    const successEmbed = new EmbedBuilder().setColor(0x00d12d).setTitle("Case Modified");

    if (!reason && state === null) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You need to modify at least the reason or the state`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    }

    const caseData = await historySchema.findOne({ case_id: caseID });

    if (caseData === null) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} No such case was found in the archive!`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    } else if (caseData.reason === reason) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} The new reason matches the old one!`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    } else if (caseData.opened === state) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} The case is already ${
            state === true ? "active" : "inactive"
          }!`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    } else if (reason && state === null) {
      await historySchema.findOneAndUpdate({ case_id: caseID }, { reason: `${reason}` });

      try {
        const message = await modlogsChannel.messages.fetch(caseData.msg_id);

        await historySchema.findOneAndUpdate({ case_id: caseID }, { edited: true });

        const receivedEmbed = message.embeds[0];
        const newEmbed = EmbedBuilder.from(receivedEmbed).setFields(
          {
            name: `Case:`,
            value: `\`${caseID}\` ${caseData.opened === true ? emojis.success : emojis.cancel}`,
            inline: true,
          },
          { name: `Type:`, value: `\`${caseData.type_name}\``, inline: true },
          {
            name: `Moderator:`,
            value: `\`${caseData.mod_tag}\` ${emojis.moderator}`,
            inline: true,
          },
          {
            name: `Target:`,
            value: `${emojis.triangleRight} \`${caseData.user_tag}\` ${emojis.target}`,
          },
          { name: `Reason (Edited):`, value: `${reason}` }
        );

        message.edit({ embeds: [newEmbed] });
      } catch (error) {
        console.log(error);
        successEmbed.setDescription(
          [
            `Changes have been made!`,
            `**Message Edit:** ${emojis.cancel}`,
            `**Archive Edit:** ${emojis.success}`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
      }

      successEmbed.setDescription(
        [
          `Changes have been made!`,
          `**Message Edit:** ${emojis.success}`,
          `**Archive Edit:** ${emojis.success}`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    } else if ((state !== null) & !reason) {
      await historySchema.findOneAndUpdate({ case_id: caseID }, { opened: `${state}` });

      try {
        const message = await modlogsChannel.messages.fetch(caseData.msg_id);

        const receivedEmbed = message.embeds[0];
        const newEmbed = EmbedBuilder.from(receivedEmbed).setFields(
          {
            name: `Case:`,
            value: `\`${caseID}\` ${state === true ? emojis.success : emojis.cancel}`,
            inline: true,
          },
          { name: `Type:`, value: `\`${caseData.type_name}\``, inline: true },
          {
            name: `Moderator:`,
            value: `\`${caseData.mod_tag}\` ${emojis.moderator}`,
            inline: true,
          },
          {
            name: `Target:`,
            value: `${emojis.triangleRight} \`${caseData.user_tag}\` ${emojis.target}`,
          },
          { name: `Reason${caseData.edited ? " (Edited)" : ""}:`, value: `${caseData.reason}` }
        );

        message.edit({ embeds: [newEmbed] });
      } catch (error) {
        console.log(error);
        successEmbed.setDescription(
          [
            `Changes have been made!`,
            `**Message Edit:** ${emojis.cancel}`,
            `**Archive Edit:** ${emojis.success}`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
      }

      successEmbed.setDescription(
        [
          `Changes have been made!`,
          `**Message Edit:** ${emojis.success}`,
          `**Archive Edit:** ${emojis.success}`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    } else if (reason && state !== null) {
      await historySchema.findOneAndUpdate(
        { case_id: caseID },
        { opened: `${state}`, reason: `${reason}` }
      );

      try {
        const message = await modlogsChannel.messages.fetch(caseData.msg_id);

        await historySchema.findOneAndUpdate({ case_id: caseID }, { edited: true });

        const receivedEmbed = message.embeds[0];
        const newEmbed = EmbedBuilder.from(receivedEmbed).setFields(
          {
            name: `Case:`,
            value: `\`${caseID}\` ${state === true ? emojis.success : emojis.cancel}`,
            inline: true,
          },
          { name: `Type:`, value: `\`${caseData.type_name}\``, inline: true },
          {
            name: `Moderator:`,
            value: `\`${caseData.mod_tag}\` ${emojis.moderator}`,
            inline: true,
          },
          {
            name: `Target:`,
            value: `${emojis.triangleRight} \`${caseData.user_tag}\` ${emojis.target}`,
          },
          { name: `Reason (Edited):`, value: `${reason}` }
        );

        message.edit({ embeds: [newEmbed] });
      } catch (error) {
        console.log(error);
        successEmbed.setDescription(
          [
            `Changes have been made!`,
            `**Message Edit:** ${emojis.cancel}`,
            `**Archive Edit:** ${emojis.success}`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
      }

      successEmbed.setDescription(
        [
          `Changes have been made!`,
          `**Message Edit:** ${emojis.success}`,
          `**Archive Edit:** ${emojis.success}`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    }
  },
};
