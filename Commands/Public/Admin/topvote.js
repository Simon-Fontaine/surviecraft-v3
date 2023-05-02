const { PermissionFlagsBits, ChannelType, AttachmentBuilder, ButtonStyle } = require("discord.js");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");

const config = require("../../../config.json");
const IDs = require("../../../ids.json");
const { isHighStaff } = require("../../../Functions/roleChecker");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topvote")
    .setDescription("Envoie le message des codes promos dans le sallon annonces")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option.setName("1er-gagnant").setDescription("Le 1er gagnant").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("2eme-gagnant").setDescription("Le 2eme gagnant").setRequired(true)
    )
    .addUserOption((option) =>
      option.setName("3eme-gagnant").setDescription("Le 3eme gagnant").setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("1er-prix")
        .setDescription("Le montant du 1er prix")
        .setRequired(true)
        .setMinValue(0)
    )
    .addNumberOption((option) =>
      option
        .setName("2eme-prix")
        .setDescription("Le montant du 2eme prix")
        .setRequired(true)
        .setMinValue(0)
    )
    .addNumberOption((option) =>
      option
        .setName("3eme-prix")
        .setDescription("Le montant du 3eme prix")
        .setRequired(true)
        .setMinValue(0)
    )
    .addIntegerOption((option) =>
      option
        .setName("1er-nombre-votes")
        .setDescription("Le nombre de votes du 1er gagnant")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("2eme-nombre-votes")
        .setDescription("Le nombre de votes du 2eme gagnant")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("3eme-nombre-votes")
        .setDescription("Le nombre de votes du 3eme gagnant")
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const { guild, options, member } = interaction;

    const nopermissionsEmbed = new EmbedBuilder()
      .setColor(0x00e1ff)
      .setDescription(config.noPermissions);

    if (!isHighStaff(member)) {
      return interaction.editReply({ embeds: [nopermissionsEmbed] });
    }

    const premierGagnant = interaction.options.getMember("1er-gagnant");
    const deuxièmeGagnant = interaction.options.getMember("2eme-gagnant");
    const troisièmeGagnant = interaction.options.getMember("3eme-gagnant");
    const premierPrix = interaction.options.getNumber("1er-prix");
    const deuxièmePrix = interaction.options.getNumber("2eme-prix");
    const troisièmePrix = interaction.options.getNumber("3eme-prix");
    const premierNombresVotes = interaction.options.getInteger("1er-nombre-votes");
    const deuxièmeNombresVotes = interaction.options.getInteger("2eme-nombre-votes");
    const troisièmeNombresVotes = interaction.options.getInteger("3eme-nombre-votes");

    const ANNOUNCEMENT_CHANNEL = await guild.channels.cache.get(IDs.announcementChannel);

    interaction.editReply({
      content: `Votre annonce va être envoyée dans ${ANNOUNCEMENT_CHANNEL}`,
      ephemeral: true,
    });

    const oldRole = await guild.roles.cache.find((role) => role.name == "| Top Voteurs");
    if (!oldRole) {
      return interaction.editReply({
        content: "Err: Aucuns rôle trouvé !",
        ephemeral: true,
      });
    }

    await guild.roles.delete(oldRole.id, "Suppression du rôle Top Voteurs").catch(() => {
      return interaction.editReply({
        content: "Err: Problème survenu lors de la suppression du rôle !",
        ephemeral: true,
      });
    });

    const newRole = await guild.roles
      .create({
        name: oldRole.name,
        color: oldRole.color,
        hoist: oldRole.hoist,
        position: oldRole.position,
        permissions: oldRole.permissions,
        mentionable: oldRole.mentionable,
        reason: "Création du rôle Top Voteurs",
      })
      .catch(() => {
        return interaction.editReply({
          content: "Err: Problème survenu lors de la création du rôle !",
          ephemeral: true,
        });
      });

    const members = [];
    members.push(premierGagnant, deuxièmeGagnant, troisièmeGagnant);

    for (let i = 0; i < members.length; i++) {
      members[i].roles.add(newRole).catch(() => {});
    }

    const images = [
      "https://imgur.com/v5a5ixJ",
      "https://imgur.com/v5nR7W9",
      "https://imgur.com/2cu7rak",
      "https://imgur.com/RP0jZ8M",
    ];

    const image = images[Math.floor(Math.random() * images.length)];
    // const attachment = new AttachmentBuilder(image);

    const content = [
      `🏆 **Annonce ${newRole} de ce mois-ci :**`,
      ``,
      `**Top** 1️⃣ ${premierGagnant} avec ${premierNombresVotes} votes (${premierPrix}€ boutique)`,
      `**Top** 2️⃣ ${deuxièmeGagnant} avec ${deuxièmeNombresVotes} votes (${deuxièmePrix}€ boutique)`,
      `**Top** 3️⃣ ${troisièmeGagnant} avec ${troisièmeNombresVotes} votes (${troisièmePrix}€ boutique)`,
      ``,
      `> __Félicitations__ à eux ! Les votes sont maintenant réinitialisés.`,
      ``,
      `<@&${IDs.allNotifsRole}>`,
    ].join("\n");

    ANNOUNCEMENT_CHANNEL.send({
      content: content,
    }).then(() => {
      ANNOUNCEMENT_CHANNEL.send({
        content: image,
      });
      interaction.editReply({
        content: `**Done !**`,
        ephemeral: true,
      });
    });
  },
};
