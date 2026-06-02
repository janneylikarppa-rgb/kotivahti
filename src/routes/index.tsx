import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getReadySession } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Menu, X, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getReadySession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ scrollBehavior: "smooth" }}>
      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur border-b border-border" : "bg-background/60 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl text-foreground">
            Koti<span style={{ color: "#C9A84C" }}>vahti</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#ominaisuudet" className="text-muted-foreground hover:text-foreground transition">
              Ominaisuudet
            </a>
            <Link to="/rekisteroidy">
              <Button size="sm" className="uppercase tracking-wider font-semibold">
                Aloita ilmaiseksi
              </Button>
            </Link>
          </div>
          <button className="md:hidden text-foreground" onClick={() => setMenuOpen((v) => !v)} aria-label="Valikko">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-background border-t border-border px-6 py-4 flex flex-col gap-4 text-sm">
            <a href="#ominaisuudet" onClick={() => setMenuOpen(false)} className="text-muted-foreground">
              Ominaisuudet
            </a>
            <Link to="/rekisteroidy" onClick={() => setMenuOpen(false)}>
              <Button size="sm" className="w-full uppercase tracking-wider font-semibold">
                Aloita ilmaiseksi
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="grid lg:grid-cols-2 min-h-[90vh] pt-16">
        {/* LEFT */}
        <div
          className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16"
          style={{ background: "#0D1F14" }}
        >
          <div className="max-w-xl">
            <p
              className="text-xs font-semibold tracking-[0.22em] uppercase animate-in fade-in slide-in-from-top-2 duration-500 flex items-center gap-3"
              style={{ color: "#C9A84C" }}
            >
              <span style={{ display: "inline-block", width: 28, height: 1, background: "#C9A84C" }} />
              Ilmainen talokirja
            </p>
            <h1
              className="font-serif mt-5 leading-[1.05] animate-in fade-in slide-in-from-top-3 duration-500"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", color: "#F5EDD8", animationDelay: "100ms", animationFillMode: "both" }}
            >
              Talosi tiedot
              <br />
              vihdoin
              <br />
              <em className="italic" style={{ color: "#C9A84C" }}>
                järjestyksessä.
              </em>
            </h1>
            <p
              className="mt-6 text-base leading-relaxed font-light animate-in fade-in slide-in-from-top-3 duration-500"
              style={{ color: "rgba(245,237,216,0.55)", animationDelay: "200ms", animationFillMode: "both" }}
            >
              Tiedätkö milloin ilmanvaihto on viimeksi puhdistettu? Entä koska putket tai katto on tarkastettu? Kotivahti
              pitää nämä tiedot tallessa – ja muistuttaa ajoissa ennen kuin tulee kalliiksi.
            </p>
            <div
              className="mt-8 animate-in fade-in slide-in-from-top-3 duration-500"
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              <Link to="/rekisteroidy">
                <button
                  className="inline-flex items-center justify-center font-semibold transition hover:brightness-110"
                  style={{
                    background: "#C9A84C",
                    color: "#0a1208",
                    borderRadius: 6,
                    padding: "0.9rem 2rem",
                  }}
                >
                  Avaa talokirja – ilmaiseksi →
                </button>
              </Link>
            </div>
            <ul
              className="mt-8 space-y-2 animate-in fade-in duration-500"
              style={{
                fontSize: "0.77rem",
                color: "rgba(245,237,216,0.35)",
                animationDelay: "400ms",
                animationFillMode: "both",
              }}
            >
              <li>✓ Kaikki ominaisuudet ilmaisia</li>
              <li>✓ Ei luottokorttia eikä sitoumuksia</li>
              <li>✓ Käyttöönotto alle minuutissa</li>
            </ul>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center px-6 py-16 lg:py-12" style={{ background: "#F0EBE1" }}>
          <div
            className="w-full overflow-hidden"
            style={{
              maxWidth: 420,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 20px 50px -20px rgba(13,31,20,0.35)",
            }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between" style={{ background: "#0D1F14", padding: "1rem 1.25rem" }}>
              <div>
                <div className="font-serif text-base" style={{ color: "#F5EDD8" }}>
                  Kotivahti
                </div>
                <div className="text-[0.65rem] mt-0.5" style={{ color: "rgba(245,237,216,0.45)" }}>
                  Koivutie 12 · Kuopio
                </div>
              </div>
              <div
                className="text-[0.7rem] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(201,168,76,0.15)",
                  color: "#C9A84C",
                }}
              >
                82 kuntopistettä
              </div>
            </div>

            {/* Card body */}
            <div className="p-5 space-y-5">
              {/* Section 1 - tasks */}
              <div>
                <div className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase mb-2" style={{ color: "#6B5A42" }}>
                  Kevään tehtävät
                </div>
                <ul className="space-y-1.5">
                  {[
                    { label: "IV-suodattimet", done: true },
                    { label: "Räystäskourut puhdistettu", done: true },
                    { label: "Katon tarkastus", done: false },
                    { label: "Vikavirtasuojan testaus", done: false },
                    { label: "Salaojat ja kaivot", done: false },
                  ].map((t) => (
                    <li
                      key={t.label}
                      className="flex items-center gap-2.5"
                      style={{
                        background: "#F6F0E7",
                        borderRadius: 7,
                        padding: "0.55rem 0.7rem",
                        border: "1px solid rgba(107,90,66,0.1)",
                      }}
                    >
                      <span
                        className="flex items-center justify-center shrink-0"
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 999,
                          background: t.done ? "#2D4A25" : "transparent",
                          border: t.done ? "none" : "1.5px solid rgba(107,90,66,0.25)",
                          color: "#fff",
                        }}
                      >
                        {t.done && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span
                        className="text-[0.8rem]"
                        style={{
                          color: t.done ? "rgba(107,90,66,0.5)" : "#3a2f20",
                          textDecoration: t.done ? "line-through" : "none",
                        }}
                      >
                        {t.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2 - costs */}
              <div>
                <div className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase mb-2" style={{ color: "#6B5A42" }}>
                  Vuosikulut 2026
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "2 480€", l: "Sähkö" },
                    { v: "580€", l: "Vesi" },
                    { v: "2 340€", l: "Lämpö" },
                  ].map((c) => (
                    <div
                      key={c.l}
                      className="text-center"
                      style={{ background: "#F6F0E7", borderRadius: 8, padding: "0.6rem 0.4rem" }}
                    >
                      <div className="font-serif text-base" style={{ color: "#0D1F14" }}>
                        {c.v}
                      </div>
                      <div className="text-[0.6rem] mt-0.5 font-semibold tracking-[0.14em] uppercase" style={{ color: "#6B5A42" }}>
                        {c.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3 - warning */}
              <div
                style={{
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 8,
                  padding: "0.75rem",
                }}
              >
                <div className="text-[0.62rem] font-semibold tracking-[0.16em] uppercase" style={{ color: "#8B6914" }}>
                  ⚠ Seuraava PTS-toimenpide
                </div>
                <div className="font-serif text-[1.05rem] mt-1" style={{ color: "#0D1F14" }}>
                  Ilmanvaihtokone – huolto
                </div>
                <div className="text-[0.7rem] mt-1" style={{ color: "#6B5A42" }}>
                  Suositellaan 2027 · Asennettu 2005, kanavat puhdistamatta 12v
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="flex gap-2" style={{ background: "#F0EBE1", padding: "0.85rem 1.25rem" }}>
              <button
                className="flex-1 text-[0.8rem] font-semibold py-2 rounded-md transition hover:brightness-125"
                style={{ background: "#0D1F14", color: "#C9A84C" }}
              >
                Tilaa kuntoarvio
              </button>
              <button
                className="flex-1 text-[0.8rem] font-semibold py-2 rounded-md transition hover:bg-black/5"
                style={{ background: "transparent", color: "#0D1F14" }}
              >
                Katso kaikki
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RIBBON - Mikä Kotivahti on */}
      <section className="px-6 sm:px-12 py-16 relative overflow-hidden" style={{ background: "#0D1F14" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.07), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <p
            className="text-[0.7rem] font-semibold tracking-[0.24em] uppercase inline-flex items-center gap-3"
            style={{ color: "#C9A84C" }}
          >
            <span style={{ display: "inline-block", width: 24, height: 1, background: "#C9A84C" }} />
            Uutta · Ilmainen talokirja
            <span style={{ display: "inline-block", width: 24, height: 1, background: "#C9A84C" }} />
          </p>
          <h2
            className="font-serif mt-4 leading-tight"
            style={{ fontSize: "clamp(1.875rem, 4vw, 2.5rem)", color: "#F5EDD8" }}
          >
            Yksi sovellus –{" "}
            <em className="italic" style={{ color: "#C9A84C" }}>
              koko talon hallinta.
            </em>
          </h2>
          <p
            className="mt-5 text-sm sm:text-base font-light leading-relaxed mx-auto max-w-2xl"
            style={{ color: "rgba(245,237,216,0.6)" }}
          >
            Talokirja, vuosikello, kulujenseuranta, PTS-suunnitelma ja palveluiden kilpailutus –
            kaikki samassa paikassa. Aina ilmainen.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {[
              { icon: "📒", label: "Talokirja" },
              { icon: "📅", label: "Vuosikello" },
              { icon: "💰", label: "Kulujenseuranta" },
              { icon: "📊", label: "PTS-suunnitelma" },
              { icon: "🛠", label: "Huoltohistoria" },
              { icon: "🤝", label: "Palveluiden kilpailutus" },
            ].map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 text-[0.8rem]"
                style={{
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "#F5EDD8",
                  borderRadius: 999,
                  padding: "0.5rem 0.95rem",
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </span>
            ))}
          </div>
          <p className="mt-6 text-[0.75rem]" style={{ color: "rgba(245,237,216,0.4)" }}>
            + myyntiraportti, muistutukset ja tarkastettujen ammattilaisten verkosto.
          </p>
        </div>
      </section>

      {/* OMINAISUUDET */}
      <section id="ominaisuudet" style={{ background: "#F0EBE1" }} className="px-6 sm:px-12 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-12">
            <h2 className="font-serif leading-tight" style={{ fontSize: "clamp(1.875rem, 4vw, 2.25rem)", color: "#0D1F14" }}>
              Kaikki mitä talo tarvitsee
              <br />
              <em className="italic" style={{ color: "#5C7A30" }}>
                — yhdessä.
              </em>
            </h2>
            <p className="text-sm font-light leading-relaxed self-end" style={{ color: "#6B5A42" }}>
              Seitsemän toimintoa jotka tekevät talostasi hyvin hoidetun – automaattisesti ja ilman vaivaa.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "📒", title: "Talokirja", desc: "Talon perustiedot, laitteet, materiaalit ja vuosiluvut yhdessä paikassa. Päivitä kerran, käytä aina." },
              { icon: "📅", title: "Vuosikello", desc: "Kausihuollot listattuna. Kuittaa tehdyksi – menee automaattisesti huoltohistoriaan." },
              { icon: "📊", title: "PTS-suunnitelma", desc: "Ennakoi milloin rakennusosat tarvitsevat toimenpiteitä. Ei yllätyksiä." },
              { icon: "💰", title: "Kulujenseuranta", desc: "Sähkö ja vesi kulutuspohjaisesti. Ennakointilaskelma tuleville vuosille." },
              { icon: "🛠", title: "Huoltohistoria", desc: "Kaikki dokumentoitu. Kuitit, kuvat, tekijät – löydät aina kun tarvitset." },
              { icon: "🤝", title: "Palveluiden kilpailutus", desc: "Tilaa kuntoarvio, huolto tai tarjouspyyntö suoraan sovelluksesta. Välitetään tarkastetuille paikallisille tekijöille." },
              { icon: "📄", title: "Myyntiraportti", desc: "Tulostettava raportti välittäjälle. Yksi nappi, kaikki tallessa." },
            ].map((f) => (
              <div
                key={f.title}
                className="transition duration-200 hover:-translate-y-0.5"
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid rgba(107,90,66,0.1)",
                  padding: "1.75rem",
                  boxShadow: "0 1px 2px rgba(13,31,20,0.04)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 12px 30px -10px rgba(13,31,20,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(13,31,20,0.04)")}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-serif text-lg mb-2" style={{ color: "#0D1F14" }}>
                  {f.title}
                </h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: "#6B5A42" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="ammattilaiset"
        className="px-6 py-24 text-center relative overflow-hidden"
        style={{ background: "#0D1F14" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,168,76,0.06), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-serif leading-tight" style={{ fontSize: "clamp(2.25rem, 5vw, 3rem)", color: "#F5EDD8" }}>
            Avaa talokirja.
            <br />
            <em className="italic" style={{ color: "#C9A84C" }}>
              Ilmaiseksi.
            </em>
          </h2>
          <p className="mt-5 text-[0.9rem] font-light" style={{ color: "rgba(245,237,216,0.45)" }}>
            Kaikki ominaisuudet heti käytössä. Ei luottokorttia eikä sitoumuksia.
          </p>
          <div className="mt-8">
            <Link to="/rekisteroidy">
              <button
                className="inline-flex items-center justify-center font-semibold transition hover:brightness-110"
                style={{
                  background: "#C9A84C",
                  color: "#0a1208",
                  borderRadius: 6,
                  padding: "0.9rem 2rem",
                }}
              >
                Aloita nyt →
              </button>
            </Link>
          </div>
          <p className="mt-6 text-xs" style={{ color: "rgba(201,168,76,0.35)" }}>
            ✅ Tarkastetut ammattilaiset · 🔒 Tietosi suojattu · 🆓 Aina ilmainen
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-6 py-7"
        style={{ background: "#0A1A10", borderTop: "1px solid rgba(201,168,76,0.15)" }}
      >
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link to="/" className="font-serif text-lg" style={{ color: "rgba(245,237,216,0.5)" }}>
            Koti<span style={{ color: "rgba(201,168,76,0.6)" }}>vahti</span>
          </Link>
          <p className="text-[0.72rem]" style={{ color: "rgba(245,237,216,0.3)" }}>
            © 2026 Kotivahti · Kuopio · Talosi oma avustaja
          </p>
        </div>
      </footer>
    </div>
  );
}
