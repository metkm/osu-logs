import { PrismaClient } from "@prisma/client";
import axios from "axios";

export const client = new PrismaClient();

axios.defaults.baseURL = "https://osu.ppy.sh/api/v2";
