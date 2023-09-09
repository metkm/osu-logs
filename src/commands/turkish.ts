import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { client } from "../prisma";

export default {
  data: new SlashCommandBuilder()
    .setName("chat")
    .setDescription("prints last 10 messages in the turkish chat."),

  execute: async (interaction: CommandInteraction) => {
    const messages = await client.message.findMany({
      take: 10,
      orderBy: {
        timestamp: "desc",
      },
      include: {
        sender: true,
      },
    });

    const longest = Math.max(
      ...messages.map((message) => message.sender.username.length),
    );

    let content = "```";
    for (const message of messages.reverse()) {
      const toAdd = longest - message.sender.username.length;
      const offset = " ".repeat(toAdd);

      content += `${message.message_id} ${offset}${message.sender.username}: ${message.content}\n`;
    }
    content += "```";

    const buttonUp = new ButtonBuilder()
      .setCustomId("up")
      .setLabel("up")
      .setStyle(ButtonStyle.Primary);

    const buttonDown = new ButtonBuilder()
      .setCustomId("down")
      .setLabel("Down")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      buttonUp,
      buttonDown,
    );

    await interaction.reply({
      content,
      components: [row],
    });
  },
};
