/** Utility process worker — placeholder until Tesseract.js is bundled. */
process.parentPort?.on("message", (event: { data: { type: string } }) => {
  if (event.data?.type === "ocr") {
    process.parentPort?.postMessage({ text: "" });
  }
});
