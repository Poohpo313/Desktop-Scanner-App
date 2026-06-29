"use strict";
/** Utility process worker — placeholder until Tesseract.js is bundled. */
process.parentPort?.on("message", (event) => {
    if (event.data?.type === "ocr") {
        process.parentPort?.postMessage({ text: "" });
    }
});
