export async function openDocumentFile(filePath: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    return { success: false, error: "File path is missing." };
  }

  if (window.bukolabs?.filesystem?.openPath) {
    return window.bukolabs.filesystem.openPath({ path: trimmed });
  }

  return { success: false, error: "Opening files is not available in this environment." };
}
