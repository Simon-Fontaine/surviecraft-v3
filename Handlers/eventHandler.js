async function loadEvents(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  const chalk = require("chalk");
  const log = console.log;

  const startTime = Date.now();

  client.events = new Map();
  const events = new Array();

  const files = await loadFiles("Events");

  for (const file of files) {
    try {
      const event = require(file);
      const execute = (...args) => event.execute(...args, client);
      const target = event.rest ? client.rest : client;

      target[event.once ? "once" : "on"](event.name, execute);
      client.events.set(event.name, execute);

      events.push({ Event: event.name, Status: "✅" });
    } catch (error) {
      events.push({ Event: file.split("/").pop().slice(0, -3), Status: "❌" });
    }
  }

  const elapsedTime = Date.now() - startTime;

  const timer = elapsedTime.toFixed(2);

  console.table(events, ["Event", "Status"]);
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  log(chalk.yellowBright.bold(`[TIME]`) + chalk.whiteBright(` ${date} | ${time}`));
  log(
    chalk.blueBright.bold(`[INFO]`) +
      chalk.whiteBright(` Loaded Events in `) +
      chalk.cyanBright.bold(timer) +
      chalk.whiteBright(`ms\n`)
  );
}

module.exports = { loadEvents };
