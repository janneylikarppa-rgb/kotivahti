import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCachedSession, getReadySession, subscribeToSession } from "@/lib/auth-session";
import { AUTH_BYPASS_ENABLED } from "@/lib/preview-flag";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { PropertySwitcher } from "@/components/property-switcher";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";
import { listKiinteistot } from "@/lib/kotivahti.functions";
import { PalauteKortti } from "@/components/palaute-kortti";
import { paivitaKirjautuminen } from "@/lib/palaute.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    if (AUTH_BYPASS_ENABLED) return;
    const session = await getReadySession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getCachedSession());
  const [previewReady, setPreviewReady] = useState(false);

  useEffect(() => {
    if (AUTH_BYPASS_ENABLED) {
      setPreviewReady(true);
      return;
    }
    const unsubscribe = subscribeToSession(setSession);
    getReadySession().then((nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        navigate({
          to: "/login",
          search: {
            redirect: `${window.location.pathname}${window.location.search}${window.location.hash}`,
          },
        });
      }
    });
    return unsubscribe;
  }, [navigate]);

  if (AUTH_BYPASS_ENABLED && !previewReady) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!session && !AUTH_BYPASS_ENABLED) {
    return <div className="min-h-screen bg-background" />;
  }

  return <AuthenticatedShell />;
}

function AuthenticatedShell() {
  const listFn = useServerFn(listKiinteistot);
  const loginFn = useServerFn(paivitaKirjautuminen);
  const { data } = useQuery({
    queryKey: ["kiinteistot-list"],
    queryFn: () => listFn({}),
    staleTime: 30_000,
  });
  useRealtimeSync(data?.valittuId ?? null);

  // Päivitä viimeisin kirjautuminen kerran per päivä per sessio
  useEffect(() => {
    if (typeof window === "undefined") return;
    const avain = "kotivahti_login_pvm";
    const tanaan = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(avain) === tanaan) return;
    localStorage.setItem(avain, tanaan);
    loginFn().catch(() => {});
  }, [loginFn]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="text-muted-foreground hover:text-cream" />
          <div className="font-serif text-base text-cream">Kotivahti</div>
          <PropertySwitcher />
        </header>
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
          <Outlet />
        </main>
        <PalauteKortti />
      </SidebarInset>
    </SidebarProvider>
  );
}
