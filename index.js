const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { User, Message, GuildMember, Reaction, ThreadMember, GuildScheduledEvent, Channel } =
  Partials;

const client = new Client({
  intents: 3276799,
  partials: [User, Channel, Message, GuildMember, Reaction, GuildScheduledEvent, ThreadMember],
});

const { loadEvents } = require("./Handlers/eventHandler");

client.config = require("./token.json");
client.commands = new Collection();
client.subCommands = new Collection();
client.events = new Collection();

const { connect } = require("mongoose");
connect(client.config.mongoURI, {}).then(() =>
  console.log("\x1b[32m%s\x1b[0m", "[DATA] Connected to MongoDB.")
);

loadEvents(client);

client.login(client.config.token);
