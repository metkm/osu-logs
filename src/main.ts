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

// if (process.env.REFRESH_TOKEN) {
// }

// await start();



// import {} from "./chat";
// import {} from "./prisma";

// const url = new URL("https://osu.ppy.sh/oauth/authorize");
// const params = new URLSearchParams({
//     client_id: "24353",
//     client_secret: "c3lfqL7Izlo9dFDve6XETrO1NJDi7WNsZNzWqh0R",
//     response_type: "code",
//     scope: "chat.read",
//     redirect_uri: "http://localhost:2000/"
// });

// url.search = params.toString();
// console.log(url.toString());

// import axios from "axios";

// const response = await axios.post("https://osu.ppy.sh/oauth/token", {
//   client_id: "24353",
//   client_secret: "c3lfqL7Izlo9dFDve6XETrO1NJDi7WNsZNzWqh0R",
//   grant_type: "authorization_code",
//   code: "def502008b7c2a82f6fc6ec46aea0d176a8f2bec80293d355cc07c19af149e7f686df48a099a7f5b3d0cf1c8493216451f7a431380970b9f31698ed89381badad09c56cfc4701335f2253bf8b99492773be49b26fc4f86a450980e87049fd38291c0c1acba2edcc9a8857616655033049c14aa2632dbba46c6a73a9e744fa774de1fa4c45bfee97eed70edd4bff0dc46dc9e9a6242e097c8ef345231c35d3209f99591a6ba641ed3ad1a6016a6387a24bb9589cbca7bb4c47533735e0b10b43a17a41013a08bb572928b38d9f36bea03e9d1a35b5a73c0ed2c762a9c8e2695ca2b326a3fd123528a432ce3da7c9a38e631882a9c74b7e380e7c28f343e9bad9ee99d885f90ef165deed3da25ab1f1ee0f38f231275fbefdb513edf162de27b7fcccd2acef85ea2b4b8369358de915e9cd1bf18eb29c35903068baa4fb3f3569a0ccbc86ef6ef6eff5d315920e7907f491b19d7119cb44727300bb9599a3ccb04ba74574e95d9bff797fe9ab700afd4fd5602079398e744",
//   redirect_uri: "http://localhost:2000/"
// }, {
//     headers: {
//         "Accept": "*/*",
//         "Content-Type": "application/x-www-form-urlencoded"
//     }
// });

// console.log(response.data);

// import "dotenv/config";
// import axios from "axios";
// import { PrismaClient, Message, User } from "@prisma/client";

// const prisma = new PrismaClient();

// interface Response extends Message {
//   sender: User
// }

// const response = await axios<Response[]>(`https://osu.ppy.sh/api/v2/chat/channels/${1397}/messages`, {
//   headers: {
//     "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`
//   },
//   params: {
//     limit: 50,
//   }
// });

// const first = response.data[0];

// const user = await prisma.user.upsert({
//   create: first.sender,
//   update: first.sender,
//   where: {
//     id: first.sender.id
//   }
// })

// const message = await prisma.message.upsert({
//   create: {
//     channel_id: first.channel_id,
//     content: first.content,
//     is_action: first.is_action,
//     message_id: first.message_id,
//     sender_id: first.sender_id,
//     timestamp: first.timestamp,
//     type: first.type,
//   },
//   update: {},
//   where: {
//     message_id: first.message_id
//   }
// });

// console.log(user, message);
