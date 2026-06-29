import { Navigate, useLocation } from "react-router-dom";
import ProductionApp from "./ProductionApp";
import FigmaApp from "./FigmaApp";
import { resolveSuperAdminFigmaRedirect } from "./routes/figmaRedirects";

const isProductionPath = (pathname: string) =>
  pathname === "/portal" || pathname.startsWith("/portal/");

export default function App() {
  const { pathname } = useLocation();

  if (pathname === "/") {
    return <Navigate to="/portal/login" replace />;
  }

  if (pathname === "/login") {
    return <Navigate to="/portal/login" replace />;
  }

  const figmaRedirect = resolveSuperAdminFigmaRedirect(pathname);
  if (figmaRedirect) {
    return <Navigate to={figmaRedirect} replace />;
  }

  if (isProductionPath(pathname)) return <ProductionApp />;
  return <FigmaApp />;
}
