import { refreshTokens } from "./tokens";
import { client } from "./prisma";
import { start } from "./chat";
import axios from "axios";

const tokens = await client.tokens.findFirst();

if (!tokens) {
  await refreshTokens(process.env.REFRESH_TOKEN!);
} else {
  axios.defaults.headers.common["Authorization"] = `Bearer ${tokens.access_token}`;

  await start();
}
