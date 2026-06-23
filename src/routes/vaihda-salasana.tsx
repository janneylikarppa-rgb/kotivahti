import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/vaihda-salasana")({
  component: ResetPasswordPage,
});

const PAGE_STYLES = `
  .auth-page { min-height: 100vh; background: #f5f0e8; font-family: 'DM Sans', system-ui, sans-serif; color: #1e3a2f; display: flex; flex-direction: column; }
  .auth-nav { padding: 1.5rem 2rem; }
  .auth-logo { display: inline-flex; align-items: center; gap: 0.6rem; text-decoration: none; }
  .auth-logo-mark { width: 36px; height: 36px; display: grid; place-items: center; background: #152a22; color: #ffffff; border-radius: 8px; font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; }
  .auth-logo-name { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: #1e3a2f; }
  .auth-logo-name .dot { color: #c8973a; }
  .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 1rem 1.5rem 3rem; }
  .auth-card { width: 100%; max-width: 440px; background: #ffffff; border: 1px solid rgba(30,58,47,0.1); border-radius: 16px; padding: 2.25rem 2rem; box-shadow: 0 20px 60px -30px rgba(30,58,47,0.25); }
  .auth-eyebrow { font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase; color: #c8973a; font-weight: 600; margin-bottom: 0.75rem; }
  .auth-title { font-family: 'Playfair Display', serif; font-size: 2rem; line-height: 1.15; color: #1e3a2f; margin: 0 0 0.5rem; font-weight: 600; }
  .auth-title em { color: #c8973a; font-style: italic; }
  .auth-field { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
  .auth-field label { font-size: 0.78rem; font-weight: 600; color: #1e3a2f; letter-spacing: 0.02em; }
  .auth-field input { width: 100%; padding: 0.7rem 0.85rem; border: 1px solid rgba(30,58,47,0.18); border-radius: 8px; background: #faf7f1; color: #1e3a2f; font-size: 0.95rem; font-family: inherit; }
  .auth-field input:focus { outline: none; border-color: #c8973a; background: #ffffff; }
  .auth-hint { font-size: 0.72rem; color: rgba(30,58,47,0.55); margin-top: 0.2rem; }
  .auth-err { font-size: 0.78rem; color: #b54a3a; margin: -0.3rem 0 0.8rem; }
  .auth-btn { width: 100%; padding: 0.85rem 1rem; border-radius: 9px; border: none; background: #c8973a; color: #1e3a2f; font-family: inherit; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
  .auth-btn:hover { background: #b8862e; }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-success { padding: 1rem; border: 1px solid rgba(30,58,47,0.15); background: #faf7f1; border-radius: 8px; font-size: 0.9rem; line-height: 1.5; color: #1e3a2f; }
`;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Salasanan tulee olla vähintään 8 merkkiä"); return; }
    if (password !== confirm) { setError("Salasanat eivät täsmää"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) { toast.error(err.message); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 2000);
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
            <p className="auth-eyebrow">Salasana</p>
            <h1 className="auth-title">Aseta uusi <em>salasana</em></h1>
            {done ? (
              <div className="auth-success">
                ✓ Salasana vaihdettu onnistuneesti. Sinut ohjataan kojelaudalle...
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: "1.5rem" }}>
                <div className="auth-field">
                  <label htmlFor="password">Uusi salasana</label>
                  <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <span className="auth-hint">Vähintään 8 merkkiä</span>
                </div>
                <div className="auth-field">
                  <label htmlFor="confirm">Vahvista uusi salasana</label>
                  <input id="confirm" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                {error && <div className="auth-err">{error}</div>}
                <button type="submit" disabled={loading} className="auth-btn">
                  {loading ? "Tallennetaan..." : "Tallenna uusi salasana"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
