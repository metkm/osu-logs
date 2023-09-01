import { client } from "./prisma";
import axios from "axios";

import { createInterface } from "readline/promises";
const readline = createInterface({
  input: process.stdin,
  output: process.stdout
})

interface Tokens {
  token_type: "Bearer";
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export const getAuthUrl = () => {
  const url = new URL('https://osu.ppy.sh/oauth/authorize');
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: "code",
    scope: "chat.read"
  });

  url.search = params.toString();
  return url.toString();
}

export const getCode = async () => {
  console.log(getAuthUrl());

  const code = await readline.question("Code: ");
  try {
    return await getAccessTokens(code);
  } catch (error) {
    if (!axios.isAxiosError(error)) return;
    console.log(error.response.data);
    return getCode();
  }
}

export const getAccessTokens = async (code: string) => {
  const response = await axios.post<Tokens>("https://osu.ppy.sh/oauth/token", {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: process.env.REDIRECT_URI,
  });

  await client.tokens.upsert({
    create: response.data,
    update: response.data,
    where: {
      access_token: response.data.access_token
    }
  });

  axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
  console.log("Got access tokens.");
  return response.data;
};

export const refreshTokens = async (refreshToken: string) => {
  const response = await axios.post<Tokens>("https://osu.ppy.sh/oauth/token", {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const tokens = await client.tokens.findFirst();
  await client.tokens.upsert({
    create: response.data,
    update: response.data,
    where: {
      access_token: tokens.access_token
    }
  });

  axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
  console.log("refreshed tokens");
  return response.data;
};
