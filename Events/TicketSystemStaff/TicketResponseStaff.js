const {
  ChatInputCommandInteraction,
  ChannelType,
  ButtonStyle,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
} = require("discord.js");

const TicketSchema = require("../../Schemas/TicketStaff");
const TicketSetup = require("../../Schemas/TicketSetupStaff");
const TicketNumber = require("../../Schemas/TicketNumberStaff");
const config = require("../../config.json");
const IDs = require("../../ids.json");
const emojis = require("../../emojis.json");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { guild, member, customId, channel } = interaction;
    const { ViewChannel, SendMessages, ReadMessageHistory, ManageChannels } = PermissionFlagsBits;

    if (!interaction.isModalSubmit()) return;

    const data = await TicketSetup.findOne({ GuildID: guild.id });
    if (!data) return;
    if (
      ![
        "Staff - Problème Mot De Passe",
        "Staff - Problème En Jeu",
        "Staff - Problème Site Web",
        "Staff - Problème Discord",
      ].includes(customId)
    )
      return;

    const dataNumber = await TicketNumber.findOne({ GuildID: guild.id });
    const ticketId = dataNumber.Number + 1;

    try {
      await guild.channels
        .create({
          name: ticketId + "-" + "staff" + "-" + interaction.user.username,
          type: ChannelType.GuildText,
          parent: data.Category,
          permissionOverwrites: [
            {
              id: data.Everyone,
              deny: [ViewChannel, SendMessages, ReadMessageHistory],
            },
            {
              id: IDs.adminRole,
              allow: [ViewChannel, SendMessages, ReadMessageHistory, ManageChannels],
            },
            {
              id: IDs.respRole,
              allow: [ViewChannel, SendMessages, ReadMessageHistory, ManageChannels],
            },
            {
              id: member.id,
              allow: [ViewChannel, SendMessages, ReadMessageHistory],
            },
          ],
        })
        .catch((error) => {
          return;
        })
        .then(async (channel) => {
          await TicketSchema.create({
            GuildID: guild.id,
            Type: customId,
            OwnerID: member.id,
            OwnerTag: member.user.tag,
            MemberID: member.id,
            ModID: null,
            ModTag: null,
            TicketID: ticketId,
            ChannelID: channel.id,
            Locked: false,
            Claimed: false,
          });
          await TicketNumber.findOneAndUpdate(
            { GuildID: guild.id },
            {
              Number: ticketId,
            },
            {
              new: true,
              upsert: true,
            }
          );
          await channel
            .setTopic(config.ticketDescription + " <@" + member.id + ">")
            .catch((error) => {
              return;
            });

          let identifiant;
          let question;
          let userIp;

          if (customId !== "Staff - Problème Discord") {
            identifiant = interaction.fields.getTextInputValue("username_input");
          }
          question = interaction.fields.getTextInputValue("question_input");
          if (customId === "Staff - Problème Mot De Passe") {
            userIp = interaction.fields.getTextInputValue("ip_input");
          }

          let descriptionString = [
            `:bust_in_silhouette: **${interaction.user.tag}** [${interaction.user.id}]`,
            `${emojis.triangleRight} Type: **${customId}**`,
          ];
          if (identifiant) {
            descriptionString.push(`${emojis.triangleRight} Identifiant: **${identifiant}**`);
          }
          if (userIp) {
            descriptionString.push(`${emojis.triangleRight} IP: **${userIp}**`);
          }

          const embed = new EmbedBuilder()
            .setColor(0x1cff6b)
            .setTitle(`${config.ticketResponseTitle} ${interaction.user.tag}`)
            .setThumbnail(
              interaction.user.avatarURL({ dynamic: true }) ?? interaction.user.defaultAvatarURL
            )
            .setDescription(descriptionString.join("\n"))
            .addFields({ name: "Question:", value: `${question}` })
            .setFooter({ text: config.ticketResponseFooter });

          const button = new ActionRowBuilder().setComponents(
            new ButtonBuilder({
              custom_id: "ticket-close-staff",
              style: ButtonStyle.Danger,
              label: config.ticketClose,
              emoji: {
                name: config.ticketCloseEmoji,
              },
            }),
            new ButtonBuilder({
              custom_id: "ticket-lock-staff",
              style: ButtonStyle.Secondary,
              label: config.ticketLock,
              emoji: {
                name: config.ticketLockEmoji,
              },
            }),
            new ButtonBuilder({
              custom_id: "ticket-unlock-staff",
              style: ButtonStyle.Secondary,
              label: config.ticketUnlock,
              emoji: {
                name: config.ticketUnlockEmoji,
              },
            }),
            new ButtonBuilder({
              custom_id: "ticket-manage-staff",
              style: ButtonStyle.Secondary,
              label: config.ticketManage,
              emoji: {
                name: config.ticketManageEmoji,
              },
            }),
            new ButtonBuilder({
              custom_id: "ticket-claim-staff",
              style: ButtonStyle.Primary,
              label: config.ticketClaim,
              emoji: {
                name: config.ticketClaimEmoji,
              },
            })
          );

          channel.send({ embeds: [embed], components: [button] }).catch((error) => {
            return;
          });
          const handlersmention = await channel.send({
            content: `<@&${IDs.adminRole}> <@&${IDs.respRole}>`,
          });
          handlersmention.delete().catch((error) => {
            return;
          });
          interaction
            .reply({ content: config.ticketCreate + " <#" + channel.id + ">", ephemeral: true })
            .catch((error) => {
              return;
            });
        });
    } catch (err) {
      return console.log(err);
    }
  },
};
