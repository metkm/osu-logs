import { createInterface } from "readline/promises";
export const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
