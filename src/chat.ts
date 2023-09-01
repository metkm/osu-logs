import { Message, User } from "@prisma/client";
import { client } from "./prisma";
import Websocket from "ws";
import axios from "axios";

interface Payload {
  event: "chat.message.new";
  data?: {
    messages: Message[];
    users: User[];
  };
}

const resetTimeout = async () => {
  console.log("resetting timeout");
  await axios.post("/chat/ack");
}

export const connect = async () => {
  const tokens = await client.tokens.findFirst();
  if (!tokens) return;

  const ws = new Websocket("wss://notify.ppy.sh", [], {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  setInterval(resetTimeout, 30_000);

  ws.on("open", () => {
    ws.send(JSON.stringify({ event: "chat.start" }));
    console.log("Connected websocket");
  });
  ws.on("message", onMessage);
  ws.on("error", error => {
    console.log("Socket error", error);
  });

  return ws;
};

const onMessage = async (buffer: Websocket.RawData) => {
  const content: Payload = JSON.parse(buffer.toString());

  if (!content.data) return;

  const trMessages = content.data.messages.filter(
    (message) => message.channel_id === 1397
  );
  const trUsers = content.data.users.filter((user) =>
    trMessages.some((msg) => msg.sender_id === user.id)
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

  let print = '';
  for (let message of trMessages) {
    print += `[message]: ${message.sender_id} ${message.content}`;
  }

  console.log(print);
};
