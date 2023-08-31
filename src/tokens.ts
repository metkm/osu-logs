import { client } from "./prisma";
import axios from "axios";

interface Tokens {
  token_type: "Bearer";
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export const getAccessTokens = async (code: string) => {
  const response = await axios.post<Tokens>("https://osu.ppy.sh/oauth/token", {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: process.env.REDIRECT_URI,
  });

  return response.data;
};

export const refreshTokens = async (refreshToken: string) => {
  const response = await axios.post<Tokens>("https://osu.ppy.sh/oauth/token", {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  await client.tokens.upsert({
    create: response.data,
    update: response.data,
    where: {
      access_token: response.data.access_token
    }
  });

  axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;

  return response.data;
};
