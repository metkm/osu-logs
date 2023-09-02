import { readline } from "./utils";
import { client } from "./prisma";
import { Tokens } from "./models";
import axios from "axios";

export const getAuthUrl = () => {
  const url = new URL("https://osu.ppy.sh/oauth/authorize");
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    response_type: "code",
    scope: "chat.read",
  });

  url.search = params.toString();
  return url.toString();
};

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
};

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
      access_token: response.data.access_token,
    },
  });

  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${response.data.access_token}`;
  console.log("Got access tokens.");
  return response.data;
};

export const refreshTokens = async () => {
  const tokens = await client.tokens.findFirst();

  const response = await axios.post<Tokens>("https://osu.ppy.sh/oauth/token", {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
  });

  await client.tokens.upsert({
    create: response.data,
    update: response.data,
    where: {
      access_token: tokens.access_token,
    },
  });

  console.log("Refreshed tokens");
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${response.data.access_token}`;
  return response.data;
};
