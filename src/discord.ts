import {
  Client,
  CommandInteraction,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from "discord.js";
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

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => void;
}

const loadCommands = async () => {
  const commandsPath = join(__dirname, "commands");
  const commandFiles = readdirSync(commandsPath).filter((file) =>
    file.endsWith(".js"),
  );

  const commands: Record<string, Command> = {};
  for (const file of commandFiles) {
    const content = await import(join("file://", commandsPath, file));
    const name = content.default.default.data.name;
    commands[name] = content.default.default;
  }

  return commands;
};

export const startDiscordBot = async () => {
  const commands = await loadCommands();

  client.on("guildCreate", async (guild) => {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_ID, guild.id),
      { body: Object.values(commands).map((command) => command.data) },
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
