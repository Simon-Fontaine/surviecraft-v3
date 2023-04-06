const { ChatInputCommandInteraction, AttachmentBuilder } = require("discord.js");
const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders");

const { profileImage } = require("discord-arts");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("memberinfo")
    .setDescription("Consulter vos informations ou celles de n'importe quel membre.")
    .setDMPermission(false)
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Voir les informations d'un membre. Laissez vide pour afficher les vôtres.")
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getMember("member") || interaction.member;

    if (member.user.bot)
      return interaction.editReply({
        embeds: [
          new EmbedBuilder().setDescription(
            "Pour l'instant, les bots ne sont pas pris en charge pour cette commande."
          ),
        ],
        ephemeral: true,
      });

    try {
      const fetchedMembers = await interaction.guild.members.fetch();

      const profileBuffer = await profileImage(member.id);
      const imageAttachment = new AttachmentBuilder(profileBuffer, {
        name: "profile.png",
      });

      const joinPosition =
        Array.from(
          fetchedMembers.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).keys()
        ).indexOf(member.id) + 1;

      const topRoles = member.roles.cache
        .sort((a, b) => b.position - a.position)
        .map((role) => role)
        .slice(0, 3);

      const userBadges = member.user.flags.toArray();

      const joinTime = parseInt(member.joinedTimestamp / 1000);
      const createdTime = parseInt(member.user.createdTimestamp / 1000);

      const Booster = member.premiumSince ? "YOUR_EMOJI_ID" : "🗙";

      const Embed = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag} | Informations Générales`,
          iconURL: member.displayAvatarURL(),
        })
        .setColor(member.displayColor)
        .setDescription(
          `Le <t:${joinTime}:D>, ${member.user.username} a rejoint en tant que **${addSuffix(
            joinPosition
          )}** membre de cette guilde.`
        )
        .setImage("attachment://profile.png")
        .addFields([
          {
            name: "Badges",
            value: `${addBadges(userBadges).join("")}`,
            inline: true,
          },
          { name: "Booster", value: `${Booster}`, inline: true },
          { name: "Top Roles", value: `${topRoles.join("")}`, inline: false },
          { name: "Created", value: `<t:${createdTime}:R>`, inline: true },
          { name: "Joined", value: `<t:${joinTime}:R>`, inline: true },
          { name: "Identifier", value: `${member.id}`, inline: false },
          {
            name: "Avatar",
            value: `[Link](${member.displayAvatarURL()})`,
            inline: true,
          },
          {
            name: "Banner",
            value: `[Link](${(await member.user.fetch()).bannerURL()})`,
            inline: true,
          },
        ]);

      interaction.editReply({ embeds: [Embed], files: [imageAttachment] });
    } catch (error) {
      interaction.editReply({
        content: "Une erreur s'est produite : Contacter le développeur",
      });
      throw error;
    }
  },
};

function addSuffix(number) {
  if (number % 100 >= 11 && number % 100 <= 13) return number + "ème";

  switch (number % 10) {
    case 1:
      return number + "er";
    case 2:
      return number + "ème";
    case 3:
      return number + "ème";
  }
  return number + "ème";
}

function addBadges(badgeNames) {
  const badgeMap = {
    ActiveDeveloper: "<:activedeveloper:1084125339376164904>",
    BugHunterLevel1: "<:discordbughunter1:1084125343885033483>",
    BugHunterLevel2: "<:discordbughunter2:1084125346321944627>",
    PremiumEarlySupporter: "<:discordearlysupporter:1084125453951963257>",
    Partner: "<:discordpartner:1084125352118460416>",
    Staff: "<:discordstaff:1084125355553595422>",
    HypeSquadOnlineHouse1: "<:hypesquadbravery:1084125331985801296>",
    HypeSquadOnlineHouse2: "<:hypesquadbrilliance:1084125334171033611>",
    HypeSquadOnlineHouse3: "<:hypesquadbalance:1084125330794610818>",
    Hypesquad: "<:hypesquadevents:1084125335471259738>",
    CertifiedModerator: "<:discordmod:1084125348377141309>",
    VerifiedDeveloper: "<:discordbotdev:1084125342505119767>",
  };

  return badgeNames.map((badgeName) => badgeMap[badgeName] || "❔");
}
