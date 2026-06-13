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

const PAGE_STYLES = `
  .auth-page { min-height: 100vh; background: #f5f0e8; font-family: 'DM Sans', system-ui, sans-serif; color: #1e3a2f; display: flex; flex-direction: column; }
  .auth-nav { padding: 1.5rem 2rem; }
  .auth-logo { display: inline-flex; align-items: center; gap: 0.6rem; text-decoration: none; }
  .auth-logo-mark { width: 36px; height: 36px; display: grid; place-items: center; background: #1e3a2f; color: #f5f0e8; border-radius: 8px; font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; }
  .auth-logo-name { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: #1e3a2f; }
  .auth-logo-name .dot { color: #c8973a; }
  .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 1rem 1.5rem 3rem; }
  .auth-card { width: 100%; max-width: 440px; background: #ffffff; border: 1px solid rgba(30,58,47,0.1); border-radius: 16px; padding: 2.25rem 2rem; box-shadow: 0 20px 60px -30px rgba(30,58,47,0.25); }
  .auth-eyebrow { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: #c8973a; font-weight: 600; margin-bottom: 0.75rem; }
  .auth-title { font-family: 'Playfair Display', serif; font-size: 2rem; line-height: 1.15; color: #1e3a2f; margin: 0 0 0.5rem; font-weight: 600; }
  .auth-title em { color: #c8973a; font-style: italic; }
  .auth-sub { font-size: 0.9rem; color: rgba(30,58,47,0.65); margin: 0 0 1.75rem; }
  .auth-sub a { color: #1e3a2f; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; text-decoration-color: #c8973a; }
  .auth-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
  .auth-field label { font-size: 0.78rem; font-weight: 600; color: #1e3a2f; letter-spacing: 0.02em; }
  .auth-field input { width: 100%; padding: 0.7rem 0.85rem; border: 1px solid rgba(30,58,47,0.18); border-radius: 8px; background: #faf7f1; color: #1e3a2f; font-size: 0.95rem; font-family: inherit; transition: border-color .15s, background .15s; }
  .auth-field input:focus { outline: none; border-color: #c8973a; background: #ffffff; }
  .auth-btn { width: 100%; padding: 0.85rem 1rem; border-radius: 9px; border: none; background: #c8973a; color: #1e3a2f; font-family: inherit; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: transform .12s, background .15s; }
  .auth-btn:hover { background: #b8862e; transform: translateY(-1px); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .auth-btn-ghost { background: #ffffff; color: #1e3a2f; border: 1px solid rgba(30,58,47,0.2); display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem; }
  .auth-btn-ghost:hover { background: #faf7f1; }
  .auth-divider { display: flex; align-items: center; gap: 0.8rem; margin: 1.4rem 0; }
  .auth-divider::before, .auth-divider::after { content: ""; flex: 1; height: 1px; background: rgba(30,58,47,0.15); }
  .auth-divider span { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(30,58,47,0.5); }
  .auth-fineprint { margin-top: 1.25rem; font-size: 0.72rem; line-height: 1.55; color: rgba(30,58,47,0.55); text-align: center; }
  .auth-fineprint a { color: #1e3a2f; text-decoration: underline; }
  .auth-back { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: rgba(30,58,47,0.6); text-decoration: none; margin-bottom: 1rem; }
  .auth-back:hover { color: #c8973a; }
  .auth-notice { margin-top: 1rem; padding: 0.75rem 0.9rem; border: 1px solid rgba(200,151,58,0.4); background: rgba(200,151,58,0.08); border-radius: 8px; font-size: 0.78rem; color: rgba(30,58,47,0.8); line-height: 1.5; }
  .auth-notice button { margin-top: 0.5rem; background: none; border: 1px solid rgba(30,58,47,0.2); padding: 0.4rem 0.7rem; border-radius: 6px; font-size: 0.72rem; cursor: pointer; color: #1e3a2f; font-family: inherit; }
  .auth-notice button:hover { background: rgba(30,58,47,0.05); }
`;

function LoginPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getCachedSession() ?? null);
  const [waitingForStoredSession, setWaitingForStoredSession] = useState(
    () => getCachedSession() === undefined && hasPersistedSessionHint(),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

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
    return <div style={{ minHeight: "100vh", background: "#f5f0e8" }} />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("not confirmed") || msg.includes("email not confirmed")) {
        setNeedsConfirm(true);
        toast.error("Vahvista sähköpostisi ensin – tarkista postilaatikkosi.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    navigate({ to: "/dashboard" });
  };

  const handleResend = async () => {
    if (!email) { toast.error("Anna sähköpostiosoite"); return; }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
    else toast.success("Vahvistuslinkki lähetetty uudelleen.");
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/login` });
    if (result.error) { toast.error(result.error.message ?? "Kirjautuminen epäonnistui"); return; }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <>
      <style>{PAGE_STYLES}</style>
      <div className="auth-page">
        <nav className="auth-nav">
          <Link to="/" className="auth-logo">
            <span className="auth-logo-mark">K</span>
            <span className="auth-logo-name">Kotivahti<span className="dot">.</span></span>
          </Link>
        </nav>
        <main className="auth-main">
          <div className="auth-card">
            <Link to="/" className="auth-back">← Etusivulle</Link>
            <p className="auth-eyebrow">Kirjaudu</p>
            <h1 className="auth-title">Tervetuloa <em>takaisin</em></h1>
            <p className="auth-sub">
              Ei vielä tiliä? <Link to="/rekisteroidy">Luo tili</Link>
            </p>

            <form onSubmit={handleEmailLogin}>
              <div className="auth-field">
                <label htmlFor="email">Sähköposti</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="auth-field">
                <label htmlFor="password">Salasana</label>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <Link to="/unohtunut-salasana" style={{ fontSize: "0.75rem", color: "rgba(30,58,47,0.6)", textDecoration: "underline", textUnderlineOffset: "2px", marginTop: "0.25rem", alignSelf: "flex-end" }}>
                  Unohditko salasanan?
                </Link>
              </div>
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
              </button>
              {needsConfirm && (
                <div className="auth-notice">
                  Sähköpostiosi ei ole vielä vahvistettu. Tarkista postilaatikko ja roskaposti.
                  <br />
                  <button type="button" onClick={handleResend}>Lähetä vahvistuslinkki uudelleen</button>
                </div>
              )}
            </form>

            <div className="auth-divider"><span>tai</span></div>

            <button type="button" onClick={handleGoogle} className="auth-btn auth-btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#1e3a2f" d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.46-1.71 4.28-5.27 4.28-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.83 3.93 14.7 3 12.17 3 6.96 3 2.75 7.21 2.75 12.45S6.96 21.9 12.17 21.9c7.02 0 9.34-4.93 9.34-7.46 0-.5-.05-.88-.16-1.34Z"/></svg>
              Jatka Googlella
            </button>

            <p className="auth-fineprint">
              <Link to="/kayttoehdot">Käyttöehdot</Link> · <Link to="/tietosuoja">Tietosuoja</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
