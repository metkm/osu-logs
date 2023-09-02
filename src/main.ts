import { getCode, refreshTokens } from "./tokens";
import { connect } from "./chat";
import { client } from "./prisma";
import { start } from "./history";

import yargs from "yargs";
import { config } from "dotenv";
config();

const main = async () => {
  const tokens = await client.tokens.findFirst();
  const argv = await yargs(process.argv).argv;

  // tokens doesn't exist, so we will create auth url and get the code from the terminal
  if (!tokens) {
    await getCode();
  } else {
    try {
      await refreshTokens(tokens.refresh_token);
    } catch {
      await client.tokens.delete({
        where: {
          access_token: tokens.access_token,
        },
      });

      return await main();
    }
  }

  if (argv.history) {
    console.log("Starting history");
    start();
  }

  if (argv.reset) {
    const update = await client.updates.findFirst();
    if (!update) return;

    await client.updates.delete({
      where: {
        last_id: update.last_id,
      },
    });

    console.log("Deleted updates");
  }

  connect();
};

main();
