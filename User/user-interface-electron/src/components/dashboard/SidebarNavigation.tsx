import { useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";
import { SidebarContent } from "./SidebarContent";

type SidebarNavigationProps = {
  /** Independent scroll column beside main content (offline split layout). */
  scrollable?: boolean;
};

export function SidebarNavigation({ scrollable = false }: SidebarNavigationProps) {
  const { mobileOpen, setMobileOpen } = useSidebar();

  useEffect(() => {
    if (!mobileOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, setMobileOpen]);

  const sidebarBg =
    "bg-[linear-gradient(180deg,#005A55_0%,#003F3C_35%,#003534_100%)]";

  const tabletAsideClass = scrollable
    ? "app-sidebar--split-scroll relative z-auto hidden w-[72px] shrink-0 md:flex lg:hidden"
    : `fixed inset-y-0 left-0 z-50 hidden h-screen w-[72px] flex-col overflow-y-auto overflow-x-hidden md:flex lg:hidden ${sidebarBg}`;

  const desktopAsideClass = scrollable
    ? "app-sidebar--split-scroll relative z-auto hidden w-60 shrink-0 lg:flex"
    : `fixed inset-y-0 left-0 z-50 hidden h-screen w-60 flex-col overflow-y-auto overflow-x-hidden lg:flex ${sidebarBg}`;

  return (
    <>
      {/* Mobile overlay */}
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Tablet collapsed sidebar */}
      <aside className={`flex flex-col ${tabletAsideClass}`} aria-label="Main sidebar">
        <SidebarContent compact scrollable={scrollable} />
      </aside>

      {/* Desktop full sidebar */}
      <aside className={`flex flex-col ${desktopAsideClass}`} aria-label="Main sidebar">
        <SidebarContent scrollable={scrollable} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col overflow-y-auto overflow-x-hidden transition-transform duration-300 ease-in-out md:hidden ${sidebarBg} ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} scrollable />
      </aside>
    </>
  );
}
