import { Outlet, useLocation } from "react-router-dom";
import AnimatedPanel from "./AnimatedPanel";
import "../styles/page-transition.css";

export default function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatedPanel transitionKey={location.pathname} className="page-transition--route">
      <Outlet />
    </AnimatedPanel>
  );
}
