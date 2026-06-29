type Props = {
  buffer: ArrayBuffer | null;
  format?: "png" | "pdf";
};

export function ScanPreview({ buffer, format = "png" }: Props) {
  if (!buffer) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed bg-gray-50 text-sm text-gray-500">
        Scan preview will appear here
      </div>
    );
  }

  if (format === "pdf") {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-gray-600">
        PDF preview ready — save to open in file manager.
      </div>
    );
  }

  const blob = new Blob([buffer], { type: "image/png" });
  const url = URL.createObjectURL(blob);

  return (
    <div className="rounded-xl border bg-white p-4">
      <img src={url} alt="Scan preview" className="max-h-96 w-full object-contain" />
    </div>
  );
}
