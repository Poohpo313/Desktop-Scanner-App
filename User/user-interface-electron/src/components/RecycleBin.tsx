import { FileCard } from "./FileCard";
import type { FileRecord } from "../hooks/useFiles";

type Props = {
  items: FileRecord[];
  onRestore: (id: number) => void;
};

export function RecycleBin({ items, onRestore }: Props) {
  return (
    <section className="card-surface p-5">
      <header className="mb-4">
        <h2 className="font-semibold text-gray-900">Recycle Bin</h2>
        <p className="text-xs text-gray-500 mt-1">Items auto-empty after 30 days</p>
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">Recycle bin is empty</p>
      ) : (
        <div className="grid gap-3">
          {items.map((file) => (
            <FileCard
              key={file.document_id}
              file={file}
              inRecycleBin
              onRestore={onRestore}
            />
          ))}
        </div>
      )}
    </section>
  );
}
