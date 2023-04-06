async function loadCommands(client) {
  const { loadFiles } = require("../Functions/fileLoader");
  console.time("Commands Loaded");

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

  console.table(table, ["Command", "Status"]);
  console.log("\x1b[32m%s\x1b[0m", "[INFO] Loaded Commands.");
  return console.timeEnd("Commands Loaded");
}

module.exports = { loadCommands };
