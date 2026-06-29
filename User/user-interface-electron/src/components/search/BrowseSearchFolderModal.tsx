import { ChooseLocalSaveFolderModal } from "../scan/offline/modals/ChooseLocalSaveFolderModal";

type BrowseSearchFolderModalProps = {
  value: string;
  onApply: (path: string) => void;
  onClose: () => void;
};

export function BrowseSearchFolderModal({ value, onApply, onClose }: BrowseSearchFolderModalProps) {
  return (
    <ChooseLocalSaveFolderModal
      value={value}
      purpose="search"
      elevated
      usePortal
      onApply={onApply}
      onClose={onClose}
    />
  );
}
