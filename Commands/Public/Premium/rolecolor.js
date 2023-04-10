const { ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const IDs = require("../../../ids.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolecolor")
    .setDescription("Permet aux Nitro Booster de changer la couleur de leur rôle")
    .addStringOption((option) =>
      option.setName("hex-color").setDescription("La couleur en hexadécimal").setRequired(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    const member = interaction.member;

    const HEX_CODE = interaction.options.getString("hex-color");

    if (!member.roles.cache.has(IDs.boostRole)) {
      return interaction.editReply({
        content: "Err: Cette commande est réservée au boosteur du serveur !",
        ephemeral: true,
      });
    }

    if (!HEX_CODE.match(/[0-9A-Fa-f]{6}/g)) {
      return interaction.editReply({
        content: `Code couleur hexadécimal invalide ! Exemples:\n0x00ff00\n#00ff00\n00ff00\n\nTrouvez la couleur parfaite ici :\n<https://www.google.com/search?q=color+picker>`,
        ephemeral: true,
      });
    }

    const name = `CustomRole-${member.id}`;
    const color = HEX_CODE.toUpperCase();
    const { cache } = guild.roles;

    const role = cache.find((role) => role.name === name);

    if (role) {
      role.setColor(color);
      member.roles.add(role);
      return interaction.editReply({
        content: `Couleur du ${role} mise à jour !`,
        ephemeral: true,
      });
    }

    const upRole = cache.get(IDs.boostRole);

    const newRole = await guild.roles.create({
      name,
      color,
      position: (upRole.rawPosition || 0) + 1,
    });

    member.roles.add(newRole);

    return interaction.editReply({
      content: `Couleur du ${newRole} mise à jour !`,
      ephemeral: true,
    });
  },
};
