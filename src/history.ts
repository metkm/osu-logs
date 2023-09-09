import { Message, User } from "@prisma/client";
import { refreshTokens } from "./tokens";
import { client } from "./prisma";
import { sleep } from "./utils";
import axios from "axios";

interface Response extends Message {
  sender: User;
}

const getMessages = async (until?: number | bigint) => {
  const response = await axios<Response[]>("/chat/channels/1397/messages", {
    params: {
      limit: 50,
      until,
    },
  });
  return response.data;
};

export const start = async () => {
  const record = await client.updates.findFirst();
  let recordLastId = record?.last_id;

  let messages = await getMessages(recordLastId);
  if (!messages[0]) return;

  let firstMessageId = messages[0].message_id;

  while (recordLastId !== firstMessageId) {
    const { count: userCount } = await client.user.createMany({
      data: messages.map((message) => message.sender),
      skipDuplicates: true,
    });

    const { count: messageCount } = await client.message.createMany({
      data: messages.map((message) => {
        const { sender, ...msg } = message; // eslint-disable-line @typescript-eslint/no-unused-vars
        return msg;
      }),
      skipDuplicates: true,
    });

    try {
      messages = await getMessages(firstMessageId);
    } catch (error) {
      await sleep(60000);

      console.log(error);
      await refreshTokens();
    }

    await client.updates.upsert({
      create: { last_id: firstMessageId },
      update: { last_id: firstMessageId },
      where: { last_id: recordLastId || 0 },
    });

    recordLastId = firstMessageId;
    firstMessageId = messages[0].message_id;

    console.log(
      `Added ${userCount} users. Added ${messageCount} messages. Sleeping for 10 seconds`,
    );
    await sleep(10_000);
  }
};
