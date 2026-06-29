import { useLocation } from "react-router-dom";
import { getPageMeta } from "./pageMeta";

export function Breadcrumb() {
  const { pathname } = useLocation();
  const meta = getPageMeta(pathname);

  return (
    <nav className="app-breadcrumb" aria-label="Breadcrumb">
      <span className="app-breadcrumb__brand">bukolabs.io</span>
      <span className="mx-2">/</span>
      <span>{meta.crumb}</span>
    </nav>
  );
}
