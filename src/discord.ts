import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { chat } from "./commands";

export const startDiscordBot = async () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessages,
    ],
  });

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  client.once(Events.ClientReady, () => {
    console.log("client ready");
  });

  client.on("guildCreate", (guild) => {
    rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_ID, guild.id),
      { body: [chat.data] },
    );
  });

  client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    if (commandName === "chat") {
      chat.execute(interaction);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
};
