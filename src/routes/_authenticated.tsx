import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getCachedSession, getReadySession, subscribeToSession } from "@/lib/auth-session";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const session = await getReadySession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const [session, setSession] = useState(() => getCachedSession());

  useEffect(() => subscribeToSession(setSession), []);

  if (!session) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="text-muted-foreground hover:text-cream" />
          <div className="font-serif text-base text-cream">Kotivahti</div>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
