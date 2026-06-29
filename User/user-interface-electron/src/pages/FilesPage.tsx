import { DocumentsPageView } from "../components/documents/DocumentsPageView";
import { OfflineSectionView } from "../components/offline";
import { useAppMode } from "../context/AppModeContext";
import "../styles/documents-page.css";

export default function FilesPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return <OfflineSectionView section="Documents" screenSlug="section-offline-documents" />;
  }

  return <DocumentsPageView />;
}
