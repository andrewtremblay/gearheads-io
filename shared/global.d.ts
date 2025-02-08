// additional env types

declare global {
  namespace NodeJS {
    interface Process {
      env: {
        DATABASE_URL: string;
      };
    }
  }
  interface Window {
    adsbygoogle: any[];
  }
}
