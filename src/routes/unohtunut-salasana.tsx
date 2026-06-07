import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/unohtunut-salasana")({
  component: ForgotPasswordPage,
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
  .auth-sub { font-size: 0.9rem; color: rgba(30,58,47,0.65); margin: 0 0 1.75rem; line-height: 1.5; }
  .auth-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
  .auth-field label { font-size: 0.78rem; font-weight: 600; color: #1e3a2f; letter-spacing: 0.02em; }
  .auth-field input { width: 100%; padding: 0.7rem 0.85rem; border: 1px solid rgba(30,58,47,0.18); border-radius: 8px; background: #faf7f1; color: #1e3a2f; font-size: 0.95rem; font-family: inherit; }
  .auth-field input:focus { outline: none; border-color: #c8973a; background: #ffffff; }
  .auth-btn { width: 100%; padding: 0.85rem 1rem; border-radius: 9px; border: none; background: #c8973a; color: #1e3a2f; font-family: inherit; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
  .auth-btn:hover { background: #b8862e; }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-back { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: rgba(30,58,47,0.6); text-decoration: none; margin-bottom: 1rem; }
  .auth-back:hover { color: #c8973a; }
  .auth-success { padding: 1rem; border: 1px solid rgba(30,58,47,0.15); background: #faf7f1; border-radius: 8px; font-size: 0.9rem; line-height: 1.5; color: #1e3a2f; }
`;

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Always show success for security – do not reveal if email exists
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/vaihda-salasana",
    });
    setLoading(false);
    setSent(true);
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
            <Link to="/login" className="auth-back">← Kirjautumiseen</Link>
            <p className="auth-eyebrow">Palauta</p>
            <h1 className="auth-title">Nollaa <em>salasana</em></h1>
            {sent ? (
              <div className="auth-success">
                ✓ Linkki lähetetty. Tarkasta sähköpostisi – linkki on voimassa tunnin.
              </div>
            ) : (
              <>
                <p className="auth-sub">
                  Syötä sähköpostiosoitteesi – lähetämme sinulle linkin salasanan vaihtamiseen.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="auth-field">
                    <label htmlFor="email">Sähköpostiosoite</label>
                    <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? "Lähetetään..." : "Lähetä palautuslinkki"}
                  </button>
                </form>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
