import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { getCachedSession, subscribeToSession } from "@/lib/auth-session";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-4">404 · Sivua ei löytynyt</p>
        <h1 className="text-5xl font-serif text-cream">Hukassa metsässä</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Etsimääsi sivua ei ole olemassa tai se on siirretty.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition hover:bg-[color:var(--gold-2)]"
          >
            Takaisin etusivulle
          </Link>
        </div>
      </div>
    </div>
  );
}

function isChunkLoadError(error: unknown): boolean {
  const msg = (error as any)?.message ?? String(error ?? "");
  return /Importing a module script failed|Failed to fetch dynamically imported module|ChunkLoadError|Loading chunk \d+ failed|Load failed/i.test(msg);
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const chunkError = isChunkLoadError(error);

  if (chunkError && typeof window !== "undefined") {
    const key = "__kotivahti_chunk_reload";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      // Aseta reload heti — ei flash-virhenäkymää
      window.location.reload();
    }
    // Renderöi tyhjä tausta uudelleenlatauksen ajan
    return <div className="min-h-screen bg-background" />;
  }

  console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-4">Virhe</p>
        <h1 className="text-3xl font-serif text-cream">Sivua ei voitu ladata</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-[color:var(--gold-2)]"
          >
            Yritä uudelleen
          </button>
        </div>
      </div>
    </div>
  );
}


export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kotivahti – Huoltokirja omakotitaloasujille" },
      {
        name: "description",
        content: "Pidä talosi huoltohistoria, kulut ja vuosikello järjestyksessä yhdessä paikassa.",
      },
      { property: "og:title", content: "Kotivahti" },
      { property: "og:description", content: "Huoltokirja omakotitaloasujille." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [session, setSession] = useState(() => getCachedSession() ?? null);
  const authUserIdRef = useRef(session?.user.id ?? null);
  const isAuthenticated = !!session;

  useEffect(() => {
    return subscribeToSession((nextSession) => {
      const nextUserId = nextSession?.user.id ?? null;
      const authUserChanged = authUserIdRef.current !== nextUserId;

      setSession(nextSession);

      if (authUserChanged) {
        authUserIdRef.current = nextUserId;
        router.invalidate();
        queryClient.invalidateQueries();
      }
    });
  }, [router, queryClient]);

  useEffect(() => {
    document.documentElement.dataset.authenticated = isAuthenticated ? "true" : "false";
  }, [isAuthenticated]);

  return null;
}

function ChunkReloadGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "__kotivahti_chunk_reload";
    // Clear stale reload flag after successful load
    const t = setTimeout(() => sessionStorage.removeItem(key), 3000);
    const onPreloadError = (e: Event) => {
      e.preventDefault();
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    };
    window.addEventListener("vite:preloadError", onPreloadError as EventListener);
    return () => {
      clearTimeout(t);
      window.removeEventListener("vite:preloadError", onPreloadError as EventListener);
    };
  }, []);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ChunkReloadGuard />
      <AuthSync />
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}

