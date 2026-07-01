/**
 * Keeps the blob URL alive briefly so the download is not cancelled too early.
 */
export function downloadCsvInBrowser(content: string, filename: string, mime = "text/csv;charset=utf-8;"): number {
  const csvBody = content.startsWith("\uFEFF") ? content : `\uFEFF${content}`;
  const blob = new Blob([csvBody], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 2_000);

  return blob.size;
}

export function downloadBlobInBrowser(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();

  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 2_000);
}
