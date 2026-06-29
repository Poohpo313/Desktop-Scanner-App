export async function openDocumentFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    return { success: false, error: "File path is missing." };
  }

  if (window.bukolabs?.filesystem?.openInWord) {
    const ext = trimmed.split(".").pop()?.toLowerCase();
    if (ext === "doc" || ext === "docx" || ext === "rtf") {
      const wordResult = await window.bukolabs.filesystem.openInWord({ path: trimmed });
      if (wordResult.success) return wordResult;
    }
  }

  if (window.bukolabs?.filesystem?.openPath) {
    return window.bukolabs.filesystem.openPath({ path: trimmed });
  }

  return { success: false, error: "Opening files is not available in this environment." };
}

export async function openDocumentInWord(
  filePath: string,
): Promise<{ success: boolean; error?: string }> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    return { success: false, error: "File path is missing." };
  }

  if (window.bukolabs?.filesystem?.openInWord) {
    return window.bukolabs.filesystem.openInWord({ path: trimmed });
  }

  return { success: false, error: "Editing in Word is not available in this environment." };
}
