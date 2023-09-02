declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_ID: string;
      CLIENT_SECRET: string;
      REDIRECT_URI: string;
    }
  }
}

export {}
