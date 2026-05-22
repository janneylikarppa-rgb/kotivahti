import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getReadySession } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

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
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* NAV */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur border-b border-border"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl text-foreground">
            Koti<span className="text-primary">vahti</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#ominaisuudet" className="text-muted-foreground hover:text-foreground transition">
              Ominaisuudet
            </a>
            <a href="#ammattilaiset" className="text-muted-foreground hover:text-foreground transition">
              Ammattilaiset
            </a>
            <a href="#hinnat" className="text-muted-foreground hover:text-foreground transition">
              Hinnat
            </a>
            <Link to="/login">
              <Button size="sm" className="uppercase tracking-wider font-semibold">
                Kirjaudu sisään
              </Button>
            </Link>
          </div>
          <button
            className="md:hidden text-foreground"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Valikko"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-background border-t border-border px-6 py-4 flex flex-col gap-4 text-sm">
            <a href="#ominaisuudet" onClick={() => setMenuOpen(false)} className="text-muted-foreground">Ominaisuudet</a>
            <a href="#ammattilaiset" onClick={() => setMenuOpen(false)} className="text-muted-foreground">Ammattilaiset</a>
            <a href="#hinnat" onClick={() => setMenuOpen(false)} className="text-muted-foreground">Hinnat</a>
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              <Button size="sm" className="w-full uppercase tracking-wider font-semibold">
                Kirjaudu sisään
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex items-center pt-24 pb-16 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 25% 50%, color-mix(in oklab, var(--gold) 14%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <p className="eyebrow flex items-center gap-3">
              <span className="block h-px w-8 bg-primary" /> Talosi oma avustaja
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              Pidä talo kunnossa.
              <br />
              <em className="not-italic italic text-primary">Ilman stressiä.</em>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Digitaalinen talokirja joka muistuttaa huolloista, seuraa kulut ja välittää sinut
              pätevän ammattilaisen luo – kun on aika.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/rekisteroidy">
                <Button size="lg" className="uppercase tracking-wider font-semibold">
                  Aloita ilmaiseksi →
                </Button>
              </Link>
              <a
                href="#ominaisuudet"
                className="text-sm text-foreground hover:text-primary transition underline-offset-4 hover:underline"
              >
                Katso miten toimii ↓
              </a>
            </div>
          </div>

          <div className="gold-card p-6 sm:p-8 shadow-xl animate-in fade-in slide-in-from-top-6 duration-700 delay-200 fill-mode-both">
            <p className="eyebrow mb-1">Talokirja</p>
            <h3 className="font-serif text-2xl text-foreground mb-6">Koivutie 12, Kuopio</h3>
            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-border">
              {[
                { v: "34", l: "Huoltoa" },
                { v: "82", l: "Kuntopisteet" },
                { v: "9v", l: "Dataa" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-serif text-3xl text-foreground">{s.v}</div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-foreground/90">Öljykattilan vuosihuolto tehty</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">✓</span>
                <span className="text-foreground/90">Kylpyhuone remontoitu 2022</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">!</span>
                <span className="text-primary">IV-kone – kuntoarvio 2027</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* OMINAISUUDET */}
      <section id="ominaisuudet" className="py-24 px-6 bg-secondary">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl mb-14">
            <p className="eyebrow mb-3 flex items-center gap-3">
              <span className="block h-px w-8 bg-primary" /> Ominaisuudet
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-foreground">
              Kaikki talosi tiedot <em className="italic text-primary">yhdessä paikassa</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📅", title: "Vuosikello", desc: "Kausikohtainen huoltolista kevät, kesä, syksy ja talvi. Kuittaa tehdyksi yhdellä painalluksella." },
              { icon: "📊", title: "PTS-suunnitelma", desc: "Laskee automaattisesti milloin öljykattila, IV-kone tai viemärit tarvitsevat toimenpiteitä." },
              { icon: "💰", title: "Kulujenseuranta", desc: "Seuraa sähkön, veden ja lämmityksen kulutusta. Syötä vain mittarilukemat." },
              { icon: "🔧", title: "Huoltohistoria", desc: "Kirjaa tehdyt huollot ja remontit. Dokumentit ja kuitit tallessa myyntihetkellä." },
              { icon: "👷", title: "Ammattilaiset", desc: "Pyydä kuntoarviota tai kilpailuta remontti. Kaikki ammattilaiset tarkastettuja." },
              { icon: "📄", title: "Myyntiraportti", desc: "Tulosta siisti raportti välittäjälle – kaikki huollot ja kulutukset dokumentoituna." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border bg-card p-6 transition hover:border-primary/60 hover:shadow-md"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-serif text-xl text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="hinnat" className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 50%, color-mix(in oklab, var(--gold) 18%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl sm:text-5xl text-foreground mb-4">
            Aloita tänään. <em className="italic text-primary">Ilmaiseksi.</em>
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Luo ilmainen talokirja muutamassa minuutissa. Ei luottokorttia, ei sitoumuksia.
          </p>
          <Link to="/rekisteroidy">
            <Button size="lg" className="uppercase tracking-wider font-semibold">
              Luo talokirja nyt →
            </Button>
          </Link>
          <p id="ammattilaiset" className="text-xs text-muted-foreground mt-6">
            ✅ Kaikki ammattilaisemme ovat tarkastettuja ja sertifioituja
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-serif text-xl text-foreground">
            Koti<span className="text-primary">vahti</span>
          </Link>
          <p className="text-xs text-muted-foreground">
            © 2026 Kotivahti · Kuopio · Talosi oma avustaja
          </p>
        </div>
      </footer>
    </div>
  );
}
