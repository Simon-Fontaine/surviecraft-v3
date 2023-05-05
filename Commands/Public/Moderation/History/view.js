const { ChatInputCommandInteraction, ButtonStyle, EmbedBuilder } = require("discord.js");
const Pagination = require("customizable-discordjs-pagination");
const historySchema = require("../../../../Schemas/History.js");
const config = require("../../../../config.json");
const IDs = require("../../../../ids.json");
const emojis = require("../../../../emojis.json");
const { isStaff } = require("../../../../Functions/roleChecker.js");

module.exports = {
  subCommand: "history.view",
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
    const caseType = interaction.options.getString("type");
    const user = interaction.options.getUser("user");
    const mod = interaction.options.getUser("mod");

    let typeName;

    if (caseType) {
      if (caseType === "+warn") {
        typeName = "Warn";
      } else if (caseType === "+timeout") {
        typeName = "+Timeout";
      } else if (caseType === "-timeout") {
        typeName = "-Timeout";
      } else if (caseType === "+kick") {
        typeName = "Kick";
      } else if (caseType === "+ban") {
        typeName = "Ban";
      } else if (caseType === "-ban") {
        typeName = "Unban";
      }
    }

    if (user && mod) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't filter by both user and moderator.`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    } else if (caseID && (caseType || user || mod)) {
      failedOperationEmbed.setDescription(
        [
          `${emojis.cancel} **Unsuccessful Operation!**`,
          `${emojis.space}${emojis.arrowRight} You can't filter by both case ID and other filters.`,
        ].join("\n")
      );
      return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
    } else if (caseID && (!caseType || !user || !mod)) {
      const caseData = await historySchema.findOne({
        guild_id: `${interaction.guild.id}`,
        case_id: caseID,
      });

      if (caseData === null) {
        failedOperationEmbed.setDescription(
          [
            `${emojis.cancel} **Unsuccessful Operation!**`,
            `${emojis.space}${emojis.arrowRight} This case does not exist.`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
      }

      let color = "";

      switch (caseData.type) {
        case "+ban":
          color = 0xff0000;
          break;
        case "+warn":
          color = 0x8400ff;
          break;
        case "+kick":
          color = 0xffc400;
          break;
        case "+timeout":
          color = 0x0008ff;
          break;
        case "-ban":
          color = 0xff6a00;
          break;
        case "-timeout":
          color = 0x00eaff;
          break;
      }

      const caseEmbed = new EmbedBuilder()
        .setColor(color)
        .setThumbnail(caseData.user_avatar)
        .addFields(
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
            value: `${emojis.triangleRight} \`${caseData.user_tag}\` ${caseData.user_id}`,
          },
          {
            name: `Reason${caseData.edited ? " (Edited)" : ""}:`,
            value: `\`${caseData.reason}\``,
          }
        )
        .setFooter({ text: caseData.format_time });

      return await interaction.editReply({ embeds: [caseEmbed], ephemeral: true });
    } else if (!caseType && !user && !mod && !caseID) {
      const caseData = await historySchema.find({ guild_id: `${interaction.guild.id}` });

      if (caseData.length < 1) {
        failedOperationEmbed.setDescription(
          [
            `${emojis.cancel} **Unsuccessful Operation!**`,
            `${emojis.space}${emojis.arrowRight} There are no cases in the database.`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
      }

      let caseString = "";
      let caseStrings = [];
      for (let i = 0; i < caseData.length; i++) {
        caseString += caseString.length < 1 ? "" : "\n ";
        caseString += `${caseData[i].opened === true ? emojis.success : emojis.cancel} \`${
          caseData[i].case_id
        }\` **[${caseData[i].type.toUpperCase()}]** <t:${caseData[i].unix_time}:R>`;

        if (!((i + 1) % 10) || i + 1 === caseData.length) {
          caseStrings.push(caseString);
          caseString = "";
        }
      }

      const caseEmbed = caseStrings.map(
        (data) =>
          new EmbedBuilder({
            title: `${interaction.guild.name} Mod Cases (${caseData.length}):`,
            description: data,
          })
      );

      const buttons = [
        { emoji: emojis.doubleLeftArrow, style: ButtonStyle.Secondary },
        { emoji: emojis.arrowLeft, style: ButtonStyle.Secondary },
        { emoji: emojis.arrowRight, style: ButtonStyle.Secondary },
        { emoji: emojis.doubleRightArrow, style: ButtonStyle.Secondary },
      ];

      new Pagination()
        .setCommand(interaction)
        .setPages(caseEmbed)
        .setButtons(buttons)
        .setPaginationCollector({ components: "disappear", timeout: 30000, ephemeral: true })
        .setSelectMenu({ enable: false })
        .setFooter({ option: "default" })
        .send();
    } else if (user) {
      if (caseType) {
        const caseData = await historySchema.find({
          guild_id: `${interaction.guild.id}`,
          type: caseType,
          user_id: `${user.id}`,
        });

        if (caseData.length < 1) {
          failedOperationEmbed.setDescription(
            [
              `${emojis.cancel} **Unsuccessful Operation!**`,
              `${emojis.space}${emojis.arrowRight} There are no cases of type \`${typeName}\` for ${user.tag} in the database.`,
            ].join("\n")
          );
          return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
        }

        let caseString = "";
        let caseStrings = [];

        for (let i = 0; i < caseData.length; i++) {
          caseString += caseString.length < 1 ? "" : "\n ";
          caseString += `${caseData[i].opened === true ? emojis.success : emojis.cancel} \`${
            caseData[i].case_id
          }\` **[${caseData[i].type.toUpperCase()}]** <t:${caseData[i].unix_time}:R>`;

          if (!((i + 1) % 10) || i + 1 === caseData.length) {
            caseStrings.push(caseString);
            caseString = "";
          }
        }

        const caseEmbed = caseStrings.map(
          (data) =>
            new EmbedBuilder({
              title: `${user.tag} ${typeName} Cases (${caseData.length}):`,
              description: data,
            })
        );

        const buttons = [
          { emoji: emojis.doubleLeftArrow, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowLeft, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowRight, style: ButtonStyle.Secondary },
          { emoji: emojis.doubleRightArrow, style: ButtonStyle.Secondary },
        ];

        new Pagination()
          .setCommand(interaction)
          .setPages(caseEmbed)
          .setButtons(buttons)
          .setPaginationCollector({ components: "disappear", timeout: 30000, ephemeral: true })
          .setSelectMenu({ enable: false })
          .setFooter({ option: "default" })
          .send();
      } else {
        const caseData = await historySchema.find({
          guild_id: `${interaction.guild.id}`,
          user_id: `${user.id}`,
        });

        if (caseData.length < 1) {
          failedOperationEmbed.setDescription(
            [
              `${emojis.cancel} **Unsuccessful Operation!**`,
              `${emojis.space}${emojis.arrowRight} There are no cases for ${user.tag} in the database.`,
            ].join("\n")
          );
          return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
        }

        let caseString = "";
        let caseStrings = [];

        for (let i = 0; i < caseData.length; i++) {
          caseString += caseString.length < 1 ? "" : "\n ";
          caseString += `${caseData[i].opened === true ? emojis.success : emojis.cancel} \`${
            caseData[i].case_id
          }\` **[${caseData[i].type.toUpperCase()}]** <t:${caseData[i].unix_time}:R>`;

          if (!((i + 1) % 10) || i + 1 === caseData.length) {
            caseStrings.push(caseString);
            caseString = "";
          }
        }

        const caseEmbed = caseStrings.map(
          (data) =>
            new EmbedBuilder({
              title: `${user.tag} Mod Cases (${caseData.length}):`,
              description: data,
            })
        );

        const buttons = [
          { emoji: emojis.doubleLeftArrow, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowLeft, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowRight, style: ButtonStyle.Secondary },
          { emoji: emojis.doubleRightArrow, style: ButtonStyle.Secondary },
        ];

        new Pagination()
          .setCommand(interaction)
          .setPages(caseEmbed)
          .setButtons(buttons)
          .setPaginationCollector({ components: "disappear", timeout: 30000, ephemeral: true })
          .setSelectMenu({ enable: false })
          .setFooter({ option: "default" })
          .send();
      }
    } else if (mod) {
      if (caseType) {
        const caseData = await historySchema.find({
          guild_id: `${interaction.guild.id}`,
          type: caseType,
          mod_id: `${mod.id}`,
        });

        if (caseData.length < 1) {
          failedOperationEmbed.setDescription(
            [
              `${emojis.cancel} **Unsuccessful Operation!**`,
              `${emojis.space}${emojis.arrowRight} There are no cases of type \`${typeName}\` for ${mod.tag} in the database.`,
            ].join("\n")
          );
          return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
        }

        let caseString = "";
        let caseStrings = [];

        for (let i = 0; i < caseData.length; i++) {
          caseString += caseString.length < 1 ? "" : "\n ";
          caseString += `${caseData[i].opened === true ? emojis.success : emojis.cancel} \`${
            caseData[i].case_id
          }\` **[${caseData[i].type.toUpperCase()}]** <t:${caseData[i].unix_time}:R>`;

          if (!((i + 1) % 10) || i + 1 === caseData.length) {
            caseStrings.push(caseString);
            caseString = "";
          }
        }

        const caseEmbed = caseStrings.map(
          (data) =>
            new EmbedBuilder({
              title: `${mod.tag} ${typeName} Cases (${caseData.length}):`,
              description: data,
            })
        );

        const buttons = [
          { emoji: emojis.doubleLeftArrow, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowLeft, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowRight, style: ButtonStyle.Secondary },
          { emoji: emojis.doubleRightArrow, style: ButtonStyle.Secondary },
        ];

        new Pagination()
          .setCommand(interaction)
          .setPages(caseEmbed)
          .setButtons(buttons)
          .setPaginationCollector({ components: "disappear", timeout: 30000, ephemeral: true })
          .setSelectMenu({ enable: false })
          .setFooter({ option: "default" })
          .send();
      } else {
        const caseData = await historySchema.find({
          guild_id: `${interaction.guild.id}`,
          mod_id: `${mod.id}`,
        });

        if (caseData.length < 1) {
          failedOperationEmbed.setDescription(
            [
              `${emojis.cancel} **Unsuccessful Operation!**`,
              `${emojis.space}${emojis.arrowRight} There are no cases for ${mod.tag} in the database.`,
            ].join("\n")
          );
          return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
        }

        let caseString = "";
        let caseStrings = [];

        for (let i = 0; i < caseData.length; i++) {
          caseString += caseString.length < 1 ? "" : "\n ";
          caseString += `${caseData[i].opened === true ? emojis.success : emojis.cancel} \`${
            caseData[i].case_id
          }\` **[${caseData[i].type.toUpperCase()}]** <t:${caseData[i].unix_time}:R>`;

          if (!((i + 1) % 10) || i + 1 === caseData.length) {
            caseStrings.push(caseString);
            caseString = "";
          }
        }

        const caseEmbed = caseStrings.map(
          (data) =>
            new EmbedBuilder({
              title: `${mod.tag} Mod Cases (${caseData.length}):`,
              description: data,
            })
        );

        const buttons = [
          { emoji: emojis.doubleLeftArrow, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowLeft, style: ButtonStyle.Secondary },
          { emoji: emojis.arrowRight, style: ButtonStyle.Secondary },
          { emoji: emojis.doubleRightArrow, style: ButtonStyle.Secondary },
        ];

        new Pagination()
          .setCommand(interaction)
          .setPages(caseEmbed)
          .setButtons(buttons)
          .setPaginationCollector({ components: "disappear", timeout: 30000, ephemeral: true })
          .setSelectMenu({ enable: false })
          .setFooter({ option: "default" })
          .send();
      }
    } else if (caseType && !user && !mod) {
      const caseData = await historySchema.find({
        guild_id: `${interaction.guild.id}`,
        type: caseType,
      });

      if (caseData.length < 1) {
        failedOperationEmbed.setDescription(
          [
            `${emojis.cancel} **Unsuccessful Operation!**`,
            `${emojis.space}${emojis.arrowRight} There are no cases of type \`${typeName}\` in the database.`,
          ].join("\n")
        );
        return await interaction.editReply({ embeds: [failedOperationEmbed], ephemeral: true });
      }

      let caseString = "";
      let caseStrings = [];

      for (let i = 0; i < caseData.length; i++) {
        caseString += caseString.length < 1 ? "" : "\n ";
        caseString += `${caseData[i].opened === true ? emojis.success : emojis.cancel} \`${
          caseData[i].case_id
        }\` **[${caseData[i].type.toUpperCase()}]** <t:${caseData[i].unix_time}:R>`;

        if (!((i + 1) % 10) || i + 1 === caseData.length) {
          caseStrings.push(caseString);
          caseString = "";
        }
      }

      const caseEmbed = caseStrings.map(
        (data) =>
          new EmbedBuilder({
            title: `${interaction.guild.name} ${typeName} Cases (${caseData.length}):`,
            description: data,
          })
      );

      const buttons = [
        { emoji: emojis.doubleLeftArrow, style: ButtonStyle.Secondary },
        { emoji: emojis.arrowLeft, style: ButtonStyle.Secondary },
        { emoji: emojis.arrowRight, style: ButtonStyle.Secondary },
        { emoji: emojis.doubleRightArrow, style: ButtonStyle.Secondary },
      ];

      new Pagination()
        .setCommand(interaction)
        .setPages(caseEmbed)
        .setButtons(buttons)
        .setPaginationCollector({ components: "disappear", timeout: 30000, ephemeral: true })
        .setSelectMenu({ enable: false })
        .setFooter({ option: "default" })
        .send();
    }
  },
};
