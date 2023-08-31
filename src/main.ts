import { getCode, refreshTokens } from "./tokens";
import { connect } from "./chat";
import { client } from "./prisma";
import { start } from "./history";

import { config } from "dotenv";
config();

const main = async () => {
  const tokens = await client.tokens.findFirst();

  // tokens doesn't exist, so we will create auth url and get the code from the terminal
  if (!tokens) {
    getCode();
  } else {
    try {
      await refreshTokens(tokens.refresh_token);
    } catch {
      await client.tokens.delete({
        where: {
          access_token: tokens.access_token
        }
      });

      return main();
    }
  }
  
  await start();
  await connect();
}

main();
