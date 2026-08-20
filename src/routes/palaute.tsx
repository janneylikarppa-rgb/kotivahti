import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/palaute")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
    vastaus: typeof s.vastaus === "string" ? s.vastaus : "",
    kausi: typeof s.kausi === "string" ? s.kausi : "",
  }),
  component: PalauteSivu,
});

function PalauteSivu() {
  const { token, vastaus, kausi } = Route.useSearch();
  const [tila, setTila] = useState<"laheta" | "ok" | "virhe" | "vanhentunut">("laheta");
  const [virhe, setVirhe] = useState("");

  useEffect(() => {
    if (!token || !vastaus) { setTila("virhe"); setVirhe("Linkki on puutteellinen."); return; }
    fetch("/api/public/palaute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, vastaus, kausi }),
    })
      .then(async (r) => {
        if (r.status === 410) { setTila("vanhentunut"); return; }
        if (!r.ok) {
          let msg = `Virhe ${r.status}`;
          try { const j = await r.json(); if (j?.error === "token_expired") { setTila("vanhentunut"); return; } } catch {}
          throw new Error(msg);
        }
        setTila("ok");
      })
      .catch((e) => { setTila("virhe"); setVirhe(e?.message ?? "Tuntematon virhe"); });
  }, [token, vastaus, kausi]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        {tila === "laheta" && (
          <>
            <p className="eyebrow">Käsitellään vastausta…</p>
            <h1 className="text-3xl font-serif text-cream">Hetki</h1>
          </>
        )}
        {tila === "ok" && (
          <>
            <p className="eyebrow text-primary">Kiitos!</p>
            <h1 className="text-3xl font-serif text-cream">Vastauksesi on tallennettu</h1>
            <p className="text-sm text-muted-foreground">Pidämme sinut tulevana kautena ajan tasalla.</p>
            <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-[color:var(--gold-2)] mt-4">
              Avaa Kotiluotsi
            </Link>
          </>
        )}
        {tila === "vanhentunut" && (
          <>
            <p className="eyebrow">Linkki vanhentunut</p>
            <h1 className="text-3xl font-serif text-cream">Tämä palautekutsu on vanhentunut</h1>
            <p className="text-sm text-muted-foreground">Kiitos kuitenkin kiinnostuksestasi — voit antaa palautetta sovelluksessa milloin tahansa.</p>
            <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-[color:var(--gold-2)] mt-4">
              Avaa Kotiluotsi
            </Link>
          </>
        )}
        {tila === "virhe" && (
          <>
            <p className="eyebrow">Hups</p>
            <h1 className="text-3xl font-serif text-cream">Vastausta ei voitu tallentaa</h1>
            <p className="text-sm text-muted-foreground">{virhe}</p>
            <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-[color:var(--gold-2)] mt-4">
              Avaa Kotiluotsi
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
