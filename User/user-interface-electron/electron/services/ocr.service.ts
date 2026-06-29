import { utilityProcess } from "electron";
import path from "path";

/** OCR runs in a utility process to avoid blocking the renderer. */
export const ocrService = {
  async extractText(imageBuffer: Buffer): Promise<string> {
    return new Promise((resolve) => {
      try {
        const worker = utilityProcess.fork(
          path.join(__dirname, "workers", "ocr.worker.js")
        );
        const timeout = setTimeout(() => {
          worker.kill();
          resolve("");
        }, 30_000);

        worker.on("message", (msg: { text?: string }) => {
          clearTimeout(timeout);
          worker.kill();
          resolve(msg.text ?? "");
        });

        worker.postMessage({ type: "ocr", buffer: imageBuffer });
      } catch {
        resolve("");
      }
    });
  },
};
