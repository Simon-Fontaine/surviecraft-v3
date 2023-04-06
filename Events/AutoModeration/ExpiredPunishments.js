const historySchema = require("../../Schemas/History.js");
const IDs = require("../../ids.json");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    const check = async () => {
      const query = {
        expires: { $lt: new Date() },
        type: "+ban",
        unbanned: false,
      };

      const results = await historySchema.find(query);

      for (const result of results) {
        const { guild_id, user_id, user_tag, type } = result;

        const guild = await client.guilds.fetch(guild_id);
        if (!guild) {
          console.log(`Guild ${guild_id} not found.`);
          continue;
        }

        if (type === "+ban") {
          const channel = await guild.channels.fetch(IDs.modLogsChannel);
          guild.members.unban(user_id, { reason: "Expired Ban" }).catch(() => {});
          if (channel) {
            channel.send({
              content: `[\`AUTO\`] Unbanned **${user_tag}** (expired time)`,
            });
          } else {
            console.log(`[AUTO] Unbanned ${user_tag} in ${guild_id} (expired time)`);
          }
        }
      }

      await historySchema.updateMany(query, { unbanned: true });

      setTimeout(check, 1000 * 60);
    };
    check();
  },
};
