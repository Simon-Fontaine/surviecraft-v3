const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { User, Message, GuildMember, Reaction, ThreadMember, GuildScheduledEvent, Channel } =
  Partials;

const client = new Client({
  intents: 3276799,
  partials: [User, Channel, Message, GuildMember, Reaction, GuildScheduledEvent, ThreadMember],
});

const chalk = require("chalk");
const log = console.log;

const { loadEvents } = require("./Handlers/eventHandler");

client.config = require("./token.json");
client.commands = new Collection();
client.subCommands = new Collection();
client.events = new Collection();
client.setMaxListeners(0);

const { connect } = require("mongoose");
const startTime = Date.now();
connect(client.config.mongoURI, {}).then(() => {
  const elapsedTime = Date.now() - startTime;

  const timer = elapsedTime.toFixed(2);

  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  log(chalk.yellowBright.bold(`[TIME]`) + chalk.whiteBright(` ${date} | ${time}`));
  log(
    chalk.blueBright.bold("[INFO]") +
      chalk.whiteBright(` Connected to MongoDB in `) +
      chalk.cyanBright.bold(timer) +
      chalk.whiteBright(`ms\n`)
  );
});

loadEvents(client);

client.login(client.config.token);
