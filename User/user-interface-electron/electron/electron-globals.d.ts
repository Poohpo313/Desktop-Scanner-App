/// <reference types="electron" />

declare namespace NodeJS {
  interface Process {
    resourcesPath?: string;
    parentPort?: {
      on(event: "message", listener: (event: { data: unknown }) => void): void;
      postMessage(message: unknown): void;
    };
  }
}
