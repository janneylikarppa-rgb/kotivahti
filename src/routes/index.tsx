import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getReadySession } from "@/lib/auth-session";
import { Menu, X, Check, ArrowRight, Shield, Bell, Users, FileText, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getReadySession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

// Värit
const C = {
  green: "#1e3a2f",
  greenDark: "#152a22",
  gold: "#c8973a",
  goldLight: "#e4b96a",
  cream: "#f5f0e8",
  creamDark: "#ece5d6",
};

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'DM Sans', system-ui, sans-serif";

function GoldButton({
  children,
  to,
  href,
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const pad = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";
  const base = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-px ${pad} ${className}`;
  const style: React.CSSProperties = {
    background: C.gold,
    color: C.greenDark,
    fontFamily: SANS,
  };
  if (to) {
    return (
      <Link to={to} className={base} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={base} style={style}>
      {children}
    </a>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em]"
      style={{ color: light ? C.goldLight : C.gold, fontFamily: SANS }}
    >
      <span className="h-px w-8" style={{ background: light ? C.goldLight : C.gold, opacity: 0.6 }} />
      {children}
      <span className="h-px w-8" style={{ background: light ? C.goldLight : C.gold, opacity: 0.6 }} />
    </div>
  );
}

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [aktiivinenKategoria, setAktiivinenKategoria] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ominaisuudet = [
    {
      ikoni: "📋",
      otsikko: "Talokirja",
      kuvaus: "Talon perustiedot, laitteet, materiaalit ja vuosiluvut yhdessä paikassa. Päivitä kerran, käytä aina.",
    },
    {
      ikoni: "📅",
      otsikko: "Vuosikello",
      kuvaus: "Kausihuollot listattuna. Kuittaa tehdyksi – menee automaattisesti huoltohistoriaan.",
    },
    {
      ikoni: "🤝",
      otsikko: "Palveluiden kilpailutus",
      kuvaus:
        "Tilaa kuntoarvio, huolto tai tarjouspyyntö suoraan sovelluksesta. Välitetään tarkastetuille paikallisille tekijöille – sinä valitset parhaan.",
      korostettu: true,
    },
    {
      ikoni: "📊",
      otsikko: "PTS-suunnitelma",
      kuvaus: "Ennakoi milloin rakennusosat tarvitsevat toimenpiteitä. Ei yllätyksiä.",
    },
    {
      ikoni: "💰",
      otsikko: "Kulujenseuranta",
      kuvaus: "Sähkö ja vesi kulutuspohjaisesti. Ennakointilaskelma tuleville vuosille.",
    },
    {
      ikoni: "🔧",
      otsikko: "Huoltohistoria",
      kuvaus: "Kaikki dokumentoitu. Kuitit, kuvat, tekijät – löydät aina kun tarvitset.",
    },
    {
      ikoni: "📄",
      otsikko: "Myyntiraportti",
      kuvaus: "Tulostettava raportti välittäjälle. Yksi nappi, kaikki tallessa.",
    },
  ];

  const askeleet = [
    {
      n: 1,
      otsikko: "Valitse palvelu",
      kuvaus: "Katto, LVI, sähkö, ilmanvaihto, nuohous – 14 kategoriaa suoraan sovelluksessa.",
    },
    {
      n: 2,
      otsikko: "Lähetä pyyntö",
      kuvaus: "Talon tiedot täyttyvät automaattisesti talokirjastasi. Yksi nappi.",
    },
    {
      n: 3,
      otsikko: "Saat tarjoukset",
      kuvaus: "Tarkastetut paikalliset yritykset ottavat yhteyttä. Sinä valitset.",
    },
    {
      n: 4,
      otsikko: "Ammattilainen dokumentoi",
      kuvaus: "Tehty työ, kuvat ja kuitti tallentuvat automaattisesti suoraan huoltokirjaasi.",
    },
  ];

  const kategoriat = [
    "🏠 Katto & vesikatto",
    "🔧 LVI & putket",
    "⚡ Sähkötyöt",
    "🌬️ Ilmanvaihto & IV-huolto",
    "🔥 Nuohous & tulisijat",
    "🌿 Piha & salaojat",
  ];

  const tilastot = [
    { luku: "7+", teksti: "toimintoa yhdessä sovelluksessa" },
    { luku: "0€", teksti: "kaikki ominaisuudet ilmaiseksi" },
    { luku: "14+", teksti: "ammattilaiskategoriaa kilpailutuksessa" },
    { luku: "1min", teksti: "käyttöönotto alle minuutissa" },
  ];

  const luottamus = [
    { ikoni: <Sparkles className="h-4 w-4" />, teksti: "Ilmainen kaikille ominaisuuksille" },
    { ikoni: <Shield className="h-4 w-4" />, teksti: "Tarkastettu ammattilaisten verkosto" },
    { ikoni: <Bell className="h-4 w-4" />, teksti: "Automaattiset muistutukset huolloista" },
    { ikoni: <FileText className="h-4 w-4" />, teksti: "Myyntiraportti yhdellä napilla" },
  ];

  return (
    <div className="min-h-screen" style={{ background: C.cream, color: C.greenDark, fontFamily: SANS, scrollBehavior: "smooth" }}>
      {/* NAVIGAATIO */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(245,240,232,0.92)" : "rgba(245,240,232,0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: scrolled ? `1px solid ${C.green}1f` : "1px solid transparent",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold" style={{ fontFamily: SERIF, color: C.green }}>
            Koti<span style={{ color: C.gold }}>vahti</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#ominaisuudet" className="transition hover:opacity-70" style={{ color: C.green }}>
              Ominaisuudet
            </a>
            <a href="#kilpailutus" className="transition hover:opacity-70" style={{ color: C.green }}>
              Kilpailutus
            </a>
            <GoldButton to="/rekisteroidy">Aloita ilmaiseksi</GoldButton>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Valikko" style={{ color: C.green }}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t px-6 py-4 flex flex-col gap-3" style={{ background: C.cream, borderColor: `${C.green}20` }}>
            <a href="#ominaisuudet" onClick={() => setMenuOpen(false)} style={{ color: C.green }}>
              Ominaisuudet
            </a>
            <a href="#kilpailutus" onClick={() => setMenuOpen(false)} style={{ color: C.green }}>
              Kilpailutus
            </a>
            <GoldButton to="/rekisteroidy">Aloita ilmaiseksi</GoldButton>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        className="relative min-h-screen flex items-center pt-24 pb-16"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${C.green} 0%, ${C.greenDark} 60%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Vasen */}
          <div className="animate-fade-in">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
              style={{ background: `${C.gold}1f`, color: C.goldLight, border: `1px solid ${C.gold}40` }}
            >
              <span>✦</span> Uutta · Ilmainen talokirja
            </div>
            <h1
              className="text-4xl md:text-6xl font-bold leading-[1.05] mb-6 text-white"
              style={{ fontFamily: SERIF }}
            >
              Yksi sovellus –{" "}
              <span className="italic block" style={{ color: C.goldLight }}>
                koko talon hallinta.
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-xl" style={{ color: "#cdd3cf" }}>
              Talokirja, vuosikello, kulujenseuranta, PTS-suunnitelma ja palveluiden kilpailutus – kaikki samassa
              paikassa. Aina ilmainen.
            </p>
            <GoldButton to="/rekisteroidy" size="lg">
              Avaa talokirja ilmaiseksi <ArrowRight className="h-4 w-4" />
            </GoldButton>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm" style={{ color: "#a8b0aa" }}>
              <span>
                <span style={{ color: C.goldLight }}>✓</span> Tarkastetut ammattilaiset
              </span>
              <span>
                <span style={{ color: C.goldLight }}>🔒</span> Tietosi suojattu
              </span>
              <span>
                <span style={{ color: C.goldLight }}>✦</span> Ei luottokorttia
              </span>
            </div>
          </div>

          {/* Oikea: mock dashboard */}
          <div
            className="rounded-2xl p-6 md:p-7 shadow-2xl backdrop-blur"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${C.gold}30`,
            }}
          >
            <div className="flex items-center justify-between mb-5 pb-4 border-b" style={{ borderColor: `${C.gold}25` }}>
              <div>
                <div className="text-lg font-bold text-white" style={{ fontFamily: SERIF }}>
                  Kotivahti
                </div>
                <div className="text-xs" style={{ color: "#a8b0aa" }}>
                  Koivutie 12 · Kuopio
                </div>
              </div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${C.gold}20` }}>
                🏡
              </div>
            </div>

            <div className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.goldLight }}>
                Kevään tehtävät
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 line-through opacity-50" style={{ color: "#cdd3cf" }}>
                  <Check className="h-4 w-4" style={{ color: C.goldLight }} /> IV-suodattimet
                </li>
                <li className="flex items-center gap-2 line-through opacity-50" style={{ color: "#cdd3cf" }}>
                  <Check className="h-4 w-4" style={{ color: C.goldLight }} /> Räystäskourut puhdistettu
                </li>
                <li className="flex items-center gap-2" style={{ color: "#e6eae6" }}>
                  <span className="h-4 w-4 rounded-full border" style={{ borderColor: C.goldLight }} /> Katon tarkastus
                </li>
                <li className="flex items-center gap-2" style={{ color: "#e6eae6" }}>
                  <span className="h-4 w-4 rounded-full border" style={{ borderColor: C.goldLight }} /> Vikavirtasuojan testaus
                </li>
              </ul>
            </div>

            <div className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.goldLight }}>
                Vuosikulut 2026
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { hinta: "2 480€", label: "Sähkö" },
                  { hinta: "380€", label: "Vesi" },
                  { hinta: "4 200€", label: "Lämpö" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="text-lg font-bold text-white" style={{ fontFamily: SERIF }}>
                      {k.hinta}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#a8b0aa" }}>
                      {k.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: `${C.gold}12`, border: `1px solid ${C.gold}30` }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: C.goldLight }}>
                ⚠ Seuraava PTS-toimenpide
              </div>
              <div className="text-sm font-semibold text-white">Ilmanvaihtokone – huolto</div>
              <div className="text-xs mt-1" style={{ color: "#a8b0aa" }}>
                Suositellaan 2027 · Asennettu 2005, kanavat puhdistamatta 12v
              </div>
            </div>

            <button
              className="w-full rounded-xl py-2.5 text-sm font-semibold uppercase tracking-wider transition hover:-translate-y-px"
              style={{ background: C.gold, color: C.greenDark, fontFamily: SANS }}
            >
              Tilaa kuntoarvio
            </button>
          </div>
        </div>
      </section>

      {/* LUOTTAMUSKAISTA */}
      <section className="py-6 border-y" style={{ background: C.creamDark, borderColor: `${C.green}15` }}>
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {luottamus.map((l, i) => (
            <div key={i} className="flex items-center gap-2" style={{ color: C.green }}>
              <span style={{ color: C.gold }}>{l.ikoni}</span>
              <span className="font-medium">{l.teksti}</span>
            </div>
          ))}
        </div>
      </section>

      {/* OMINAISUUDET */}
      <section id="ominaisuudet" className="py-24" style={{ background: C.cream }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14 animate-fade-in">
            <div className="flex justify-center mb-4">
              <Eyebrow>Ominaisuudet</Eyebrow>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: SERIF, color: C.green }}>
              Kaikki mitä talo tarvitsee – yhdessä.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: `${C.green}b3` }}>
              Seitsemän toimintoa jotka tekevät talostasi hyvin hoidetun – automaattisesti ja ilman vaivaa.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ominaisuudet.map((o, i) => {
              const korostettu = o.korostettu;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: korostettu ? C.green : "#ffffff",
                    color: korostettu ? "#ffffff" : C.green,
                    border: korostettu ? `1px solid ${C.gold}60` : `1px solid ${C.green}15`,
                    boxShadow: korostettu
                      ? `0 12px 32px ${C.green}40`
                      : "0 4px 14px rgba(30,58,47,0.06)",
                  }}
                >
                  <div
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                    style={{ background: C.gold }}
                  />
                  {korostettu && (
                    <div
                      className="absolute -top-3 left-6 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: C.gold, color: C.greenDark }}
                    >
                      ⭐ Suosittu
                    </div>
                  )}
                  <div className="text-3xl mb-3">{o.ikoni}</div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ fontFamily: SERIF, color: korostettu ? "#ffffff" : C.green }}
                  >
                    {o.otsikko}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: korostettu ? "#cdd3cf" : `${C.green}b3` }}>
                    {o.kuvaus}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* KILPAILUTUS */}
      <section id="kilpailutus" className="py-24" style={{ background: C.green }}>
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="mb-4">
              <Eyebrow light>Palveluiden kilpailutus</Eyebrow>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white" style={{ fontFamily: SERIF }}>
              Ammattilainen paikalle –{" "}
              <span className="italic" style={{ color: C.goldLight }}>
                yhdellä pyynnöllä.
              </span>
            </h2>
            <p className="text-lg mb-10 max-w-xl" style={{ color: "#a8b0aa" }}>
              Tilaa suoraan sovelluksesta. Kotivahti välittää pyyntösi tarkastettuihin paikallisiin yrityksiin ja sinä
              valitset parhaan tarjouksen.
            </p>
            <div className="space-y-6">
              {askeleet.map((a) => (
                <div key={a.n} className="flex gap-4">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold"
                    style={{
                      background: `${C.gold}15`,
                      border: `1px solid ${C.gold}60`,
                      color: C.goldLight,
                      fontFamily: SERIF,
                    }}
                  >
                    {a.n}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: SERIF }}>
                      {a.otsikko}
                    </h3>
                    <p className="text-sm" style={{ color: "#a8b0aa" }}>
                      {a.kuvaus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock kortti */}
          <div
            className="rounded-2xl p-6 md:p-7 backdrop-blur shadow-2xl"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.gold}30` }}
          >
            <div className="mb-5">
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: SERIF }}>
                Tilaa palvelu
              </h3>
              <p className="text-xs mt-1" style={{ color: "#a8b0aa" }}>
                Valitse kategoria – loput hoituu automaattisesti
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {kategoriat.map((k, i) => {
                const aktiivi = i === aktiivinenKategoria;
                return (
                  <button
                    key={k}
                    onClick={() => setAktiivinenKategoria(i)}
                    className="rounded-xl px-3 py-3 text-xs font-medium text-left transition"
                    style={{
                      background: aktiivi ? `${C.gold}18` : "rgba(255,255,255,0.04)",
                      border: aktiivi ? `1px solid ${C.gold}` : `1px solid rgba(255,255,255,0.08)`,
                      color: aktiivi ? C.goldLight : "#cdd3cf",
                    }}
                  >
                    {k}
                  </button>
                );
              })}
            </div>
            <div className="h-px mb-5" style={{ background: `${C.gold}25` }} />
            <div
              className="rounded-xl p-4"
              style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}40` }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: C.goldLight }}>
                Paikalliset tarjoukset – Kuopio
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  { nimi: "Yritys 1", tahdet: "★★★★★", hinta: "1 200€" },
                  { nimi: "Yritys 2", tahdet: "★★★★☆", hinta: "1 450€" },
                  { nimi: "Yritys 3", tahdet: "★★★★★", hinta: "980€" },
                ].map((y) => (
                  <div key={y.nimi} className="flex items-center justify-between text-white">
                    <span className="font-medium">{y.nimi}</span>
                    <span style={{ color: C.goldLight }}>{y.tahdet}</span>
                    <span className="font-bold" style={{ fontFamily: SERIF }}>
                      {y.hinta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MIKSI KOTIVAHTI */}
      <section className="py-24" style={{ background: C.creamDark }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Eyebrow>Miksi Kotivahti</Eyebrow>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold" style={{ fontFamily: SERIF, color: C.green }}>
              Talosi tiedot vihdoin järjestyksessä.
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tilastot.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center"
                style={{ background: "#ffffff", border: `1px solid ${C.green}15`, boxShadow: "0 4px 14px rgba(30,58,47,0.05)" }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: SERIF, color: C.gold }}>
                  {t.luku}
                </div>
                <div className="text-sm" style={{ color: `${C.green}b3` }}>
                  {t.teksti}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: C.green }}>
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="flex justify-center mb-5">
            <Eyebrow light>Aloita tänään</Eyebrow>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-5 text-white" style={{ fontFamily: SERIF }}>
            Avaa talokirja.{" "}
            <span className="italic" style={{ color: C.goldLight }}>
              Ilmaiseksi.
            </span>
          </h2>
          <p className="text-lg mb-8" style={{ color: "#a8b0aa" }}>
            Kaikki ominaisuudet heti käytössä. Ei luottokorttia eikä sitoumuksia.
          </p>
          <ul className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-6 mb-9 text-sm">
            {[
              "Kaikki ominaisuudet ilmaisia",
              "Ei luottokorttia eikä sitoumuksia",
              "Käyttöönotto alle minuutissa",
            ].map((t) => (
              <li key={t} className="flex items-center justify-center gap-2" style={{ color: "#cdd3cf" }}>
                <Check className="h-4 w-4" style={{ color: C.goldLight }} /> {t}
              </li>
            ))}
          </ul>
          <GoldButton to="/rekisteroidy" size="lg">
            Aloita nyt – ilmaiseksi <ArrowRight className="h-4 w-4" />
          </GoldButton>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-sm" style={{ background: C.greenDark, color: "#7e857f" }}>
        © 2026 Kotivahti · Talosi oma avustaja · Kuopio, Suomi
      </footer>

      {/* Käyttämättömät iconit estoa varten */}
      <span className="hidden">
        <Users />
      </span>
    </div>
  );
}
