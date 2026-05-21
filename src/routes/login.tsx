import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getCachedSession,
  getReadySession,
  hasPersistedSessionHint,
  subscribeToSession,
} from "@/lib/auth-session";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: (s.redirect as string) || "/dashboard",
  }),
  beforeLoad: async ({ search }) => {
    const session = await getReadySession();
    if (session) throw redirect({ to: search.redirect || "/dashboard" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getCachedSession() ?? null);
  const [waitingForStoredSession, setWaitingForStoredSession] = useState(
    () => getCachedSession() === undefined && hasPersistedSessionHint(),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToSession((nextSession) => {
      setSession(nextSession);
      setWaitingForStoredSession(false);
    });
    getReadySession().then((nextSession) => {
      setSession(nextSession);
      setWaitingForStoredSession(false);
    });
    return unsubscribe;
  }, []);

  if (session || waitingForStoredSession) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Kirjautuminen epäonnistui");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Vasen: brändi */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[oklch(0.18_0.025_150)] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 30% 50%, color-mix(in oklab, var(--gold) 8%, transparent), transparent 70%)",
          }}
        />
        <div className="relative flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-serif text-lg">
            K
          </div>
          <span className="font-serif text-xl text-cream">
            Kotivahti<span className="text-primary">.</span>
          </span>
        </div>
        <div className="relative">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="block h-px w-8 bg-primary" /> Omakotitalon huoltokirja
          </p>
          <h1 className="font-serif text-5xl leading-tight text-cream">
            Pidä talosi <em className="not-italic text-primary italic">arvossa</em> –
            <br />
            vuodesta toiseen.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
            Tallenna huollot, seuraa sähkö- ja vesikulutusta ja kuittaa vuosikellon työt. Yksi
            paikka koko talon tiedoille.
          </p>
        </div>
        <div className="relative text-xs text-muted-foreground/70 uppercase tracking-wider">
          © {new Date().getFullYear()} Kotivahti
        </div>
      </div>

      {/* Oikea: lomake */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <p className="eyebrow mb-3">Kirjaudu</p>
          <h2 className="font-serif text-3xl text-cream mb-2">Tervetuloa takaisin</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Ei vielä tiliä?{" "}
            <Link
              to="/rekisteroidy"
              className="text-primary hover:text-[color:var(--gold-2)] underline-offset-4 hover:underline"
            >
              Luo tili
            </Link>
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Salasana</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full uppercase tracking-wider font-semibold"
            >
              {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-background px-3 text-muted-foreground">tai</span>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={handleGoogle} className="w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.46-1.71 4.28-5.27 4.28-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.83 3.93 14.7 3 12.17 3 6.96 3 2.75 7.21 2.75 12.45S6.96 21.9 12.17 21.9c7.02 0 9.34-4.93 9.34-7.46 0-.5-.05-.88-.16-1.34Z"
              />
            </svg>
            Jatka Googlella
          </Button>
        </div>
      </div>
    </div>
  );
}
