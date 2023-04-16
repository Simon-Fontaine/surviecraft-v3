const { ChatInputCommandInteraction, PermissionFlagsBits } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");

const TicketSchema = require("../../Schemas/TicketStaff");
const config = require("../../config.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const { guild, member, customId, channel } = interaction;
    const { ManageChannels, SendMessages } = PermissionFlagsBits;
    if (!["ticket-manage-menu-staff"].includes(customId)) return;
    await interaction.deferUpdate();
    await interaction.deleteReply();
    const embed = new EmbedBuilder();
    const data = await TicketSchema.findOne({ GuildID: guild.id, ChannelID: channel.id });
    if (!data)
      return interaction
        .reply({
          embeds: [embed.setColor(0xff0000).setDescription(config.ticketError)],
          ephemeral: true,
        })
        .catch((error) => {
          return;
        });
    const findMembers = await TicketSchema.findOne({
      GuildID: guild.id,
      ChannelID: channel.id,
      MembersID: interaction.values[0],
    });
    if (!findMembers) {
      data.MembersID.push(interaction.values[0]);
      channel.permissionOverwrites
        .edit(interaction.values[0], {
          SendMessages: true,
          ViewChannel: true,
          ReadMessageHistory: true,
        })
        .catch((error) => {
          return;
        });
      interaction.channel
        .send({
          embeds: [
            embed
              .setColor(0x1cff6b)
              .setDescription("<@" + interaction.values[0] + ">" + " " + config.ticketMemberAdd),
          ],
        })
        .catch((error) => {
          return;
        });
      data.save();
    } else {
      data.MembersID.remove(interaction.values[0]);
      channel.permissionOverwrites.delete(interaction.values[0]).catch((error) => {
        return;
      });
      interaction.channel
        .send({
          embeds: [
            embed
              .setColor(0xff5252)
              .setDescription("<@" + interaction.values[0] + ">" + " " + config.ticketMemberRemove),
          ],
        })
        .catch((error) => {
          return;
        });
      data.save();
    }
  },
};
