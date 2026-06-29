import { useAppMode } from "../context/AppModeContext";
import { OfflineSectionView } from "../components/offline";
import { SearchView } from "../components/search/SearchView";

export default function SearchPage() {
  const { isOnline } = useAppMode();

  if (!isOnline) {
    return <OfflineSectionView section="Search" screenSlug="section-offline-search" />;
  }

  return <SearchView />;
}
