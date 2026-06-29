import { Navigate, useLocation } from "react-router-dom";
import ProductionApp from "./ProductionApp";
import FigmaApp from "./FigmaApp";
import { PORTAL } from "./routes/portalPaths";
import { resolveAdminFigmaRedirect } from "./routes/figmaRedirects";

const isProductionPath = (pathname: string) =>
  pathname === "/portal" || pathname.startsWith("/portal/");

export default function App() {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return <Navigate to={PORTAL.splash} replace />;
  }

  if (pathname === "/login" || pathname === "/admin-login") {
    return <Navigate to={PORTAL.login} replace />;
  }

  const figmaRedirect = resolveAdminFigmaRedirect(pathname);
  if (figmaRedirect) {
    return <Navigate to={figmaRedirect} replace />;
  }

  if (isProductionPath(pathname)) return <ProductionApp />;
  return <FigmaApp />;
}
