async function loadCommands(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  const chalk = require("chalk");
  const log = console.log;

  const startTime = Date.now();

  client.commands = new Map();
  client.subCommands = new Map();

  const commandsArray = new Array();
  const table = new Array();

  const files = await loadFiles("Commands");

  for (const file of files) {
    try {
      const command = require(file);

      if (command.subCommand) {
        client.subCommands.set(command.subCommand, command);
      } else {
        client.commands.set(command.data.name, command);

        commandsArray.push(command.data.toJSON());

        table.push({ Command: command.data.name, Status: "✅" });
      }
    } catch (error) {
      table.push({
        Command: file.split("/").pop().slice(0, -3),
        Status: "❌",
      });
    }
  }

  client.application.commands.set(commandsArray);

  const elapsedTime = Date.now() - startTime;

  const timer = elapsedTime.toFixed(2);

  console.table(table, ["Command", "Status"]);
  const time = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  log(chalk.yellowBright.bold(`[TIME]`) + chalk.whiteBright(` ${date} | ${time}`));
  log(
    chalk.blueBright.bold(`[INFO]`) +
      chalk.whiteBright(` Loaded Commands in `) +
      chalk.cyanBright.bold(timer) +
      chalk.whiteBright(`ms\n`)
  );
}

module.exports = { loadCommands };
