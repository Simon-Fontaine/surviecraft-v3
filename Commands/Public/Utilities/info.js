const { SlashCommandBuilder } = require("@discordjs/builders");
const { ChatInputCommandInteraction } = require("discord.js");
const IDs = require("../../../ids.json");

const choices = ["ip", "wiki", "invitations", "regles-ig", "regles-ds", "boost", "aide"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Donne des informations utiles sur le serveur!")
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription("Quelles informations voulez-vous obtenir ?")
        .setAutocomplete(true)
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async autocomplete(interaction) {
    const focusedValue = interaction.options.getFocused();
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
  },
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const query = interaction.options.getString("options");

    if (!choices.includes(query)) {
      return interaction.editReply({ content: "Aucune rubrique à ce sujet !", ephemeral: true });
    }

    let resultText;

    switch (query) {
      case "ip":
        resultText = "IP: **play.surviecraft.fr**\nVersion: **1.18.2**";
        break;
      case "wiki":
        resultText = "Wiki: https://surviecraft.fr/wiki";
        break;
      case "invitations":
        resultText = "Invitations: https://discord.com/invite/7Js6rjy";
        break;
      case "regles-ig":
        resultText = "Règles: https://surviecraft.fr/regles-ig";
        break;
      case "regles-ds":
        resultText = `Règles: <#${IDs.rulesChannel}>`;
        break;
      case "boost":
        resultText =
          "Start-Nitro: Accéder au serveur de votre choix, et cliquez sur la flèche en face du nom de serveur, et sur Nitro Server Boost. Une fenêtre apparaîtra pour afficher les avantages actuels et confirmer votre Boost pour ce serveur ! Cliquez sur “Boost de serveur”, et voilà le serveur est boosté !";
        break;
      case "aide":
        resultText = `Aide: Créez un demande d'aide (ticket) en visitant le salon <#${IDs.ticketChannel}>`;
        break;
    }

    interaction.editReply({ content: resultText, ephemeral: true });
  },
};
