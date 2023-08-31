import { refreshTokens } from "./tokens";
import { connect } from "./chat";
import { client } from "./prisma";
import { start } from "./history";
import axios from "axios";

const main = async () => {
  const tokens = await client.tokens.findFirst();
  
  if (!tokens) {
    await refreshTokens(process.env.REFRESH_TOKEN!);
  } else {
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokens.access_token}`;
  
    await start();
    await connect();
  }
}

main();
