const { PermissionFlagsBits, ChannelType, ButtonStyle } = require("discord.js");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");

const config = require("../../../config.json");
const { isHighStaff } = require("../../../Functions/roleChecker");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("promo")
    .setDescription("Envoie le message des codes promos dans la sallon annonces")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addIntegerOption((option) =>
      option
        .setName("montant-reduction")
        .setDescription("Le montant de la réduction en cours")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    )
    .addStringOption((option) =>
      option.setName("code-promo").setDescription("Le code de la promotion").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("jour-mois")
        .setDescription("Jusqu'à quand la réduction est valable")
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

    const MONTANT_REDUCTION = options.getInteger("montant-reduction");
    const CODE_PROMO = options.getString("code-promo");
    const JOUR_MOIS = options.getString("jour-mois");

    const ANNOUNCEMENT_CHANNEL = await guild.channels.cache.get(IDs.announcementChannel);

    const SC_EMOJIS = guild.emojis.cache.find((emoji) => emoji.name === "SC");

    if (!SC_EMOJIS) {
      return interaction.editReply({
        content: "Err: Aucuns emojis SC trouvé !",
        ephemeral: true,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Boutique")
        .setEmoji({ name: "🛒" })
        .setStyle(ButtonStyle.Link)
        .setURL("https://surviecraft.fr/shop/categories/grades")
    );

    const content = [
      `💯 **Annonce PROMOTION** 💯`,
      ``,
      `Profitez d'une promotion de **-${MONTANT_REDUCTION}%** jusqu'au \`${JOUR_MOIS}\`.`,
      ``,
      `**CODE :** \`${CODE_PROMO}\``,
      ``,
      `> Bon jeu sur **S**urvie**C**raft @everyone !`,
      `Cordialement le Staff ${SC_EMOJIS}`,
    ].join("\n");

    ANNOUNCEMENT_CHANNEL.send({
      content: content,
      components: [row],
    }).then(() => {
      interaction.editReply({
        content: `Votre annonce a été envoyée dans ${ANNOUNCEMENT_CHANNEL}`,
        ephemeral: true,
      });
    });
  },
};
