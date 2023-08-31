import { Message, User } from "@prisma/client";
import { refreshTokens } from "./tokens";
import { client } from "./prisma";
import { sleep } from "./utils";
import axios from "axios";

interface Response extends Message {
  sender: User;
}

const getMessages = async (until?: number | BigInt) => {
  const response = await axios<Response[]>("/chat/channels/1397/messages", {
    params: {
      limit: 50,
      until,
    },
  });
  return response.data;
};

export const start = async () => {
  let record = await client.updates.findFirst();
  let recordLastId = record?.last_id;

  let messages = await getMessages(recordLastId);
  let firstMessageId = messages[0].message_id;

  while (recordLastId !== firstMessageId) {
    const { count: userCount } = await client.user.createMany({
      data: messages.map(message => message.sender),
      skipDuplicates: true
    })
  
    const { count: messageCount } = await client.message.createMany({
      data: messages.map(message => {
        const { sender, ...msg } = message;
        return msg;
      }),
      skipDuplicates: true
    });

    try {
      messages = await getMessages(firstMessageId);
    } catch (error) {
      await sleep(60000);

      const tokens = await client.tokens.findFirst();
      if (!tokens) {
        break;
      }

      await refreshTokens(tokens.refresh_token);
    }
    
    await client.updates.upsert({
      create: { last_id: firstMessageId },
      update: { last_id: firstMessageId },
      where: { last_id: recordLastId || 0 }
    });

    recordLastId = firstMessageId;
    firstMessageId = messages[0].message_id;

    console.log(`Added ${userCount} users. Added ${messageCount} messages. Sleeping for 10 seconds`);
    await sleep(10_000);
  }
}
