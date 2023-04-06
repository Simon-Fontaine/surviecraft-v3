const IDs = require("../../ids.json");
const config = require("../../config.json");
const RolesMenuSchema = require("../../Schemas/RolesMenuMessage");
const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("@discordjs/builders");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    const guild = client.guilds.cache.get(IDs.guild);
    const channel = guild.channels.cache.get(IDs.rolesChannel);

    let results = await RolesMenuSchema.findById(guild.id);

    const text = config.roleMenuEmoji + " " + config.roleMenuDescription;

    const embed = new EmbedBuilder().setDescription(text).setColor(0x2b2d31);

    const rows = new ActionRowBuilder({
      components: [
        new StringSelectMenuBuilder({
          custom_id: "role_select",
          placeholder: config.roleMenuEmoji + " " + config.roleMenuPlaceholder,
          min_values: 0,
          max_values: 5,
          options: [
            {
              label: "Toutes Notifications (updates, sondages, vidéo, etc.)",
              value: IDs.allNotifsRole,
            },
            {
              label: "Nouveaux ChangeLogs",
              value: IDs.changeLogsNotifsRole,
            },
            {
              label: "Nouvelles Vidéos Youtube",
              value: IDs.videoNotifsRole,
            },
            {
              label: "Nouveaux Évents",
              value: IDs.eventNotifsRole,
            },
            {
              label: "Nouveautés Survie",
              value: IDs.survieNotifsRole,
            },
          ],
        }),
      ],
    });

    if (results) {
      const message = await channel.messages
        .fetch(results.messageId, {
          cache: true,
          force: true,
        })
        .catch(() => {});

      if (message) {
        message.edit({
          embeds: [embed],
          components: [rows],
          allowedMentions: {
            parse: [],
          },
        });
      } else {
        results = null;
      }
    }

    if (!results) {
      const message = await channel.send({
        embeds: [embed],
        components: [rows],
        allowedMentions: {
          parse: [],
        },
      });

      await RolesMenuSchema.findOneAndUpdate(
        {
          _id: guild.id,
        },
        {
          _id: guild.id,
          messageId: message.id,
        },
        {
          upsert: true,
        }
      );
    }
  },
};
