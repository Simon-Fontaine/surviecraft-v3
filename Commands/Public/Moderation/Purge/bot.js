const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const config = require("../../../../config.json");
const IDs = require("../../../../ids.json");
const emojis = require("../../../../emojis.json");
const { isStaff } = require("../../../../Functions/roleChecker.js");

module.exports = {
  subCommand: "purge.bot",
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
      return interaction.reply({ embeds: [nopermissionsEmbed] });
    }

    let amount = interaction.options.getInteger("count");
    if (amount >= 100) amount = 100;
    if (amount < 1) amount = 1;

    const fetch = await interaction.channel.messages.fetch({ limit: amount });

    let filtered = fetch.filter((m) => m.author.bot);
    let deletedMessages = await interaction.channel.bulkDelete(filtered, true);

    const results = {};
    for (const [, deleted] of deletedMessages) {
      const user = `${deleted.author.username}#${deleted.author.discriminator} [\`${deleted.author.id}\`]`;
      if (!results[user]) results[user] = 0;
      results[user]++;
    }

    const userMessageMap = Object.entries(results);

    const finalResult = `${deletedMessages.size} message${
      deletedMessages.size > 1 ? "s" : ""
    } have been deleted!\n\n${userMessageMap
      .map(([user, messages]) => `${messages} : ${emojis.success} ${user}`)
      .join("\n")}`;

    if (deletedMessages.size <= 0) {
      await interaction.editReply({
        content: `${finalResult}`,
        ephemeral: true,
      });
    }

    const logChannel = interaction.guild.channels.cache.get(IDs.logsChannel);
    const deletedLog = deletedMessages
      .map(
        (msg) =>
          `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}\n=> ${msg.content}${
            msg.attachments.size
              ? `\n[${msg.createdAt.toLocaleString()}] ${msg.author.tag}\n=> ${
                  msg.attachments.first().url
                }`
              : ""
          }`
      )
      .join("\n");

    let file;
    if (deletedMessages.size >= 1) {
      file = [
        {
          attachment: Buffer.from(deletedLog),
          name: "deletedMessages.txt",
        },
      ];
    }

    const messageResultEmbed = new EmbedBuilder()
      .setColor(0x2b2d31)
      .setTitle("Bulk Delete Result:")
      .setDescription(
        [
          `${emojis.channel} **Channel:** ${interaction.channel}`,
          `${emojis.moderator} **Moderator:** ${interaction.user}`,
          `${emojis.target} **Details:**`,
          `${emojis.space}${emojis.doubleRightArrow} Purge Request: \`${amount}\``,
          `${emojis.space}${emojis.doubleRightArrow} Messages Purged: \`${deletedMessages.size}\``,
          `${emojis.space}${emojis.doubleRightArrow} Type: \`Bot\``,
          ``,
          `**Affected User:**`,
          `${userMessageMap
            .map(([user, messages]) => `${emojis.space}${messages} : ${emojis.success} ${user}`)
            .join("\n")}`,
        ].join("\n")
      );

    if (file === undefined) {
      await logChannel.send({
        content: `${`**Messages:**\n${deletedLog}`}`,
        embeds: [messageResultEmbed],
      });
    } else {
      await logChannel.send({ files: file, embeds: [messageResultEmbed] });
    }

    await interaction.editReply({
      content: `${finalResult}`,
      ephemeral: true,
    });
  },
};
