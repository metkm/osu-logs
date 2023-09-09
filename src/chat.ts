import { Message, User } from "@prisma/client";
import { refreshTokens } from "./tokens";
import { readline, sleep } from "./utils";
import { client } from "./prisma";

import Websocket from "ws";
import axios from "axios";
import process from "process";

interface Payload {
  event: "chat.message.new";
  data?: {
    messages: Message[];
    users: User[];
  };
}

const resetTimeout = async () => {
  console.log("Resetting timeout");
  await axios.post("/chat/ack");
};

let disconnected = false;

export const connect = async () => {
  if (disconnected) {
    console.log(
      "Disconnected, waiting for 2 seconds to reconnect and refreshing tokens.",
    );
    await refreshTokens();
    await sleep(2000);
  }

  const tokens = await client.tokens.findFirst();
  if (!tokens) return;

  const ws = new Websocket("wss://notify.ppy.sh", [], {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  const intervalIdReset = setInterval(resetTimeout, 30_000);
  const intervalIdRefresh = setInterval(refreshTokens, 60 * 60 * 12 * 1000);

  ws.on("open", () => {
    ws.send(JSON.stringify({ event: "chat.start" }));
    console.log("Connected websocket");

    disconnected = false;
  });
  ws.on("message", onMessage);
  ws.on("error", (error) => {
    console.log("Socket error", error);
  });
  ws.on("close", (code, reason) => {
    console.log("Close", code, reason.toString());

    clearInterval(intervalIdRefresh);
    clearInterval(intervalIdReset);

    disconnected = true;
    connect();
  });

  readline.on("SIGINT", () => {
    console.log("Cleanup");

    clearInterval(intervalIdRefresh);
    clearInterval(intervalIdReset);

    ws.send(JSON.stringify({ event: "chat.end" }));
    process.exit();
  });

  return ws;
};

const onMessage = async (buffer: Websocket.RawData) => {
  const content: Payload = JSON.parse(buffer.toString());

  if (!content.data) return;

  const trMessages = content.data.messages.filter(
    (message) => message.channel_id === 1397,
  );
  const trUsers = content.data.users.filter((user) =>
    trMessages.some((msg) => msg.sender_id === user.id),
  );

  if (trMessages.length === 0) return;

  await client.user.createMany({
    data: trUsers,
    skipDuplicates: true,
  });

  await client.message.createMany({
    data: trMessages,
    skipDuplicates: true,
  });

  let print = "";
  for (const message of trMessages) {
    print += `[message]: ${message.sender_id} ${message.content}`;
  }

  console.log(print);
};
