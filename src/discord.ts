import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

const loadCommands = async () => {
  const commandsPath = join(__dirname, "commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js"),
  );

  const commands = {};
  for (const file of commandFiles) {
    const content = await import(join("file://", commandsPath, file));
    const key = Object.keys(content.default)[0];
    commands[key] = content.default[key];
  }

  return commands;
};

export const startDiscordBot = async () => {
  const commands = await loadCommands();

  client.on("guildCreate", async (guild) => {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_ID, guild.id),
      { body: commands },
    );
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      console.log("button click", interaction);
    }

    if (interaction.isCommand()) {
      commands[interaction.commandName].execute(interaction);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
};
