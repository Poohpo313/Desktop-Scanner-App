import type { FolderRecord } from "../hooks/useFiles";

type Props = {
  folders: FolderRecord[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
};

export function FolderTree({ folders, selectedId, onSelect }: Props) {
  const roots = folders.filter((f) => f.parent_folder_id == null);

  return (
    <nav className="space-y-0.5 text-sm">
      <button
        type="button"
        className={`w-full text-left rounded-lg px-3 py-2 transition ${
          selectedId === null
            ? "bg-brand-mint text-brand-primary font-medium"
            : "text-gray-600 hover:bg-brand-bg"
        }`}
        onClick={() => onSelect(null)}
      >
        📁 All Documents
      </button>
      {roots.map((folder) => (
        <button
          key={folder.folder_id}
          type="button"
          className={`w-full text-left rounded-lg px-3 py-2 transition ${
            selectedId === folder.folder_id
              ? "bg-brand-mint text-brand-primary font-medium"
              : "text-gray-600 hover:bg-brand-bg"
          }`}
          onClick={() => onSelect(folder.folder_id)}
        >
          📁 {folder.folder_name}
        </button>
      ))}
      {folders.length === 0 && (
        <p className="text-xs text-gray-400 px-3 py-2">No folders yet</p>
      )}
    </nav>
  );
}
