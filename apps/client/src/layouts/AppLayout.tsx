import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { LABELS, NAVIGATION_CONFIG } from "../constants";
import { BottomNav, PageHeader, SidebarNav } from "../components/shared";
import { AuthContext } from "../context/AuthContext";

export function AppLayout() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AppLayout must be used within AuthProvider");
  }

  const { role } = auth;

  if (!role) {
    return null;
  }

  const mobileNav = NAVIGATION_CONFIG[role].mobile;
  const desktopNav = NAVIGATION_CONFIG[role].desktop;

  return (
    <div className="min-h-screen bg-background-light md:flex">
      <SidebarNav items={desktopNav} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <PageHeader subtitle={role} title={LABELS.app.name} />
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 md:pb-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <BottomNav items={mobileNav} />
    </div>
  );
}
