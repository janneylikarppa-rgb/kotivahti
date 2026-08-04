import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { getReadySession } from "@/lib/auth-session";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const session = await getReadySession();
    if (session) throw redirect({ to: "/dashboard" });
  },
  component: LandingPage,
});

const STYLES = `
:root {
  --vihrea: #1e3a2f;
  --vihrea-dark: #152a22;
  --kulta: #c8973a;
  --kulta-light: #e4b96a;
  --kerma: #f5f0e8;
  --kerma-dark: #ece5d6;
  --teksti: #1a1a1a;
  --harmaa: #6b6b6b;
  --valkoinen: #ffffff;
}
.kv-page * { margin: 0; padding: 0; box-sizing: border-box; }
.kv-page { font-family: 'DM Sans', sans-serif; background: var(--kerma); color: var(--teksti); overflow-x: hidden; min-height: 100vh; }

.kv-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 3rem; background: rgba(245,240,232,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(200,151,58,0.15); }
.nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--vihrea); letter-spacing: -0.5px; }
.nav-logo span { color: var(--kulta); }
.nav-links { display: flex; align-items: center; gap: 2rem; }
.nav-links a { text-decoration: none; color: var(--harmaa); font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
.nav-links a:hover { color: var(--vihrea); }
.nav-cta { background: var(--kulta); color: var(--valkoinen) !important; padding: 0.55rem 1.4rem; border-radius: 6px; font-weight: 600 !important; font-size: 0.88rem !important; letter-spacing: 0.02em; transition: background 0.2s !important; }
.nav-cta:hover { background: #b8842e !important; color: #fff !important; }

.hero { min-height: 100vh; background: var(--vihrea-dark); display: flex; align-items: center; position: relative; overflow: hidden; padding: 7rem 3rem 5rem; }
.hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 60% 40%, rgba(200,151,58,0.08) 0%, transparent 70%); }
.hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; position: relative; }
.hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(200,151,58,0.15); border: 1px solid rgba(200,151,58,0.3); color: var(--kulta-light); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 0.4rem 1rem; border-radius: 20px; margin-bottom: 1.8rem; animation: fadeUp 0.6s ease both; }
.hero-badge::before { content: '✦'; font-size: 0.6rem; }
.hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(2.8rem, 5vw, 4.2rem); line-height: 1.1; color: var(--valkoinen); margin-bottom: 0.5rem; animation: fadeUp 0.6s 0.1s ease both; }
.hero h1 em { font-style: italic; color: var(--kulta); display: block; }
.hero-sub { font-size: 1.05rem; line-height: 1.7; color: rgba(255,255,255,0.65); margin: 1.5rem 0 2.5rem; animation: fadeUp 0.6s 0.2s ease both; }
.hero-actions { display: flex; flex-direction: column; gap: 1rem; animation: fadeUp 0.6s 0.3s ease both; }
.btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--kulta); color: var(--valkoinen); padding: 1rem 2.2rem; border-radius: 8px; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 600; letter-spacing: 0.01em; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 20px rgba(200,151,58,0.35); width: fit-content; }
.btn-primary:hover { background: #b8842e; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(200,151,58,0.45); color: var(--valkoinen); }
.hero-trust { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.trust-item { display: flex; align-items: center; gap: 0.4rem; color: rgba(255,255,255,0.55); font-size: 0.82rem; }
.trust-item span { color: var(--kulta-light); }

.hero-visual { animation: fadeUp 0.7s 0.2s ease both; }
.mock-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px); }
.mock-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
.mock-title { font-family: 'Playfair Display', serif; color: var(--valkoinen); font-size: 1rem; }
.mock-address { color: rgba(255,255,255,0.45); font-size: 0.8rem; margin-bottom: 1.5rem; }
.mock-tasks { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem; }
.mock-task { display: flex; align-items: center; gap: 0.7rem; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.65rem 0.9rem; font-size: 0.83rem; color: rgba(255,255,255,0.7); }
.mock-task.done { opacity: 0.5; text-decoration: line-through; }
.check-done { color: #4ade80; font-size: 1rem; }
.check-todo { width: 16px; height: 16px; border: 1.5px solid rgba(255,255,255,0.25); border-radius: 50%; flex-shrink: 0; }
.mock-costs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 1.2rem; }
.mock-cost { background: rgba(255,255,255,0.06); border-radius: 8px; padding: 0.7rem; text-align: center; }
.mock-cost-val { color: var(--valkoinen); font-size: 0.95rem; font-weight: 600; }
.mock-cost-label { color: rgba(255,255,255,0.4); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.15rem; }
.mock-pts { background: rgba(200,151,58,0.12); border: 1px solid rgba(200,151,58,0.25); border-radius: 10px; padding: 0.9rem; }
.mock-pts-label { color: var(--kulta-light); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.4rem; }
.mock-pts-title { color: var(--valkoinen); font-size: 0.9rem; font-weight: 500; }
.mock-pts-sub { color: rgba(255,255,255,0.45); font-size: 0.75rem; margin-top: 0.2rem; }
.mock-pts-btns { margin-top: 0.8rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.mock-pts-btn { background: var(--kulta); color: #fff; border: none; border-radius: 6px; padding: 0.45rem 1rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.mock-pts-btn-ghost { background: transparent; color: var(--kulta-light); border: 1px solid rgba(200,151,58,0.45); border-radius: 6px; padding: 0.45rem 1rem; font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

.features-strip { background: var(--kerma-dark); padding: 1.2rem 3rem; border-bottom: 1px solid rgba(0,0,0,0.07); }
.features-strip-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
.strip-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; color: var(--harmaa); }
.strip-item strong { color: var(--vihrea); }
.strip-dot { color: var(--kulta); font-size: 1.2rem; line-height: 1; }

.section-label { display: flex; align-items: center; gap: 0.8rem; color: var(--kulta); font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; margin-bottom: 1rem; }
.section-label::before, .section-label::after { content: ''; flex: 0 0 2rem; height: 1px; background: var(--kulta); opacity: 0.4; }
.section-h2 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 3.5vw, 3rem); line-height: 1.15; color: var(--vihrea); margin-bottom: 1rem; }
.section-h2 em { font-style: italic; color: var(--kulta); }
.section-lead { font-size: 1rem; color: var(--harmaa); line-height: 1.7; max-width: 520px; }

.features { padding: 6rem 3rem; background: var(--kerma); }
.features-inner { max-width: 1200px; margin: 0 auto; }
.features-head { text-align: center; margin-bottom: 4rem; }
.features-head .section-label { justify-content: center; }
.features-head .section-lead { margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.feat-card { background: var(--valkoinen); border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 1.8rem; transition: all 0.25s; position: relative; overflow: hidden; }
.feat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--kulta); opacity: 0; transition: opacity 0.25s; }
.feat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.1); }
.feat-card:hover::before { opacity: 1; }
.feat-icon { font-size: 1.8rem; margin-bottom: 1rem; }
.feat-title { font-size: 1.05rem; font-weight: 600; color: var(--vihrea); margin-bottom: 0.5rem; }
.feat-desc { font-size: 0.875rem; color: var(--harmaa); line-height: 1.6; }
.feat-card.highlight { background: var(--vihrea); border-color: var(--vihrea); }
.feat-card.highlight::before { opacity: 1; }
.feat-card.highlight .feat-title { color: var(--valkoinen); }
.feat-card.highlight .feat-desc { color: rgba(255,255,255,0.65); }
.feat-card.highlight .feat-tag { display: inline-block; background: rgba(200,151,58,0.25); color: var(--kulta-light); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 4px; margin-bottom: 0.7rem; }

.kilpailutus { padding: 6rem 3rem; background: var(--vihrea-dark); position: relative; overflow: hidden; }
.kilpailutus::before { content: ''; position: absolute; top: -30%; right: -10%; width: 50%; height: 130%; background: radial-gradient(ellipse, rgba(200,151,58,0.07) 0%, transparent 70%); }
.kilpailutus-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; position: relative; }
.kilpailutus .section-h2 { color: var(--valkoinen); }
.kilpailutus .section-lead { color: rgba(255,255,255,0.6); }
.kil-steps { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
.kil-step { display: flex; gap: 1.2rem; align-items: flex-start; }
.kil-num { flex-shrink: 0; width: 36px; height: 36px; background: rgba(200,151,58,0.2); border: 1px solid rgba(200,151,58,0.35); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--kulta-light); font-size: 0.8rem; font-weight: 700; }
.kil-step-title { color: var(--valkoinen); font-weight: 600; font-size: 0.95rem; margin-bottom: 0.2rem; }
.kil-step-desc { color: rgba(255,255,255,0.5); font-size: 0.83rem; line-height: 1.5; }

.kil-mock { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 2rem; }
.kil-mock-title { font-family: 'Playfair Display', serif; color: var(--valkoinen); font-size: 1.1rem; margin-bottom: 0.4rem; }
.kil-mock-sub { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin-bottom: 1.5rem; }
.kil-cats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 1.5rem; }
.kil-cat { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 0.7rem 0.9rem; color: rgba(255,255,255,0.65); font-size: 0.82rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
.kil-cat.active { background: rgba(200,151,58,0.2); border-color: rgba(200,151,58,0.5); color: var(--kulta-light); }
.kil-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.2rem 0; }
.kil-result { background: rgba(200,151,58,0.1); border: 1px solid rgba(200,151,58,0.25); border-radius: 10px; padding: 1rem; }
.kil-result-label { color: var(--kulta-light); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
.kil-offers { display: flex; flex-direction: column; gap: 0.5rem; }
.kil-offer { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); border-radius: 6px; padding: 0.6rem 0.8rem; }
.kil-offer-name { color: rgba(255,255,255,0.7); font-size: 0.82rem; }
.kil-offer-price { color: var(--valkoinen); font-size: 0.88rem; font-weight: 600; }
.kil-offer-stars { color: var(--kulta); font-size: 0.7rem; }

.proof { padding: 5rem 3rem; background: var(--kerma-dark); }
.proof-inner { max-width: 1200px; margin: 0 auto; }
.proof-head { text-align: center; margin-bottom: 3.5rem; }
.proof-head .section-label { justify-content: center; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 0; }
.stat-box { background: var(--valkoinen); border-radius: 12px; padding: 2rem 1.5rem; text-align: center; border: 1px solid rgba(0,0,0,0.06); }
.stat-val { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: var(--vihrea); font-weight: 700; line-height: 1; margin-bottom: 0.4rem; }
.stat-val span { color: var(--kulta); }
.stat-label { font-size: 0.82rem; color: var(--harmaa); }

.cta-section { padding: 7rem 3rem; background: var(--vihrea); text-align: center; position: relative; overflow: hidden; }
.cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,151,58,0.1) 0%, transparent 70%); }
.cta-section-inner { max-width: 700px; margin: 0 auto; position: relative; }
.cta-section .section-label { justify-content: center; margin-bottom: 1.5rem; }
.cta-section h2 { font-family: 'Playfair Display', serif; font-size: clamp(2.2rem, 4vw, 3.5rem); color: var(--valkoinen); line-height: 1.1; margin-bottom: 1rem; }
.cta-section h2 em { color: var(--kulta); font-style: italic; }
.cta-section p { color: rgba(255,255,255,0.6); font-size: 1rem; margin-bottom: 2.5rem; line-height: 1.6; }
.cta-checks { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-bottom: 2.5rem; }
.cta-check { display: flex; align-items: center; gap: 0.4rem; color: rgba(255,255,255,0.7); font-size: 0.85rem; }
.cta-check::before { content: '✓'; color: var(--kulta-light); font-weight: 700; }

.kv-footer { background: var(--vihrea-dark); padding: 2rem 3rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); }
.kv-footer span { color: var(--kulta); opacity: 0.7; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
.animate-on-scroll { opacity: 0; transform: translateY(20px); transition: opacity 0.5s ease, transform 0.5s ease; }
.animate-on-scroll.visible { opacity: 1; transform: translateY(0); }

@media (max-width: 900px) {
  .kv-nav { padding: 1rem 1.5rem; }
  .hero-inner, .kilpailutus-inner { grid-template-columns: 1fr; gap: 3rem; }
  .hero { padding: 6rem 1.5rem 4rem; }
  .features { padding: 4rem 1.5rem; }
  .features-grid { grid-template-columns: 1fr 1fr; }
  .kilpailutus { padding: 4rem 1.5rem; }
  .proof { padding: 4rem 1.5rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .cta-section { padding: 5rem 1.5rem; }
  .features-strip { padding: 1rem 1.5rem; }
}
@media (max-width: 600px) {
  .features-grid { grid-template-columns: 1fr; }
  .kil-cats { grid-template-columns: 1fr; }
  .nav-links a:not(.nav-cta) { display: none; }
}
`;

const FEATURES = [
  { icon: "📋", title: "Talokirja", desc: "Talon perustiedot, laitteet, materiaalit ja vuosiluvut yhdessä paikassa. Päivitä kerran, käytä aina." },
  { icon: "📅", title: "Vuosikello", desc: "Kausihuollot listattuna. Kuittaa tehdyksi – menee automaattisesti huoltohistoriaan." },
  { icon: "🤝", title: "Palveluiden kilpailutus", desc: "Tilaa kuntoarvio, huolto tai tarjouspyyntö suoraan sovelluksesta. Välitetään tarkastettuille paikallisille tekijöille – sinä valitset parhaan.", highlight: true, tag: "⭐ Suosittu" },
  { icon: "📊", title: "PTS-suunnitelma", desc: "Ennakoi milloin rakennusosat tarvitsevat toimenpiteitä. Ei yllätyksiä." },
  { icon: "💰", title: "Kulujenseuranta", desc: "Sähkö ja vesi kulutuspohjaisesti. Ennakointilaskelma tuleville vuosille." },
  { icon: "🔧", title: "Huoltohistoria", desc: "Kaikki dokumentoitu. Kuitit, kuvat, tekijät – löydät aina kun tarvitset." },
  { icon: "📄", title: "Myyntiraportti", desc: "Tulostettava raportti välittäjälle. Yksi nappi, kaikki tallessa." },
];

const STEPS = [
  { n: 1, title: "Valitse palvelu", desc: "Katto, LVI, sähkö, ilmanvaihto, nuohous – 14 kategoriaa suoraan sovelluksessa." },
  { n: 2, title: "Lähetä pyyntö", desc: "Talon tiedot täyttyvät automaattisesti talokirjastasi. Yksi nappi." },
  { n: 3, title: "Saat tarjoukset", desc: "Tarkastetut paikalliset yritykset ottavat yhteyttä. Sinä valitset." },
  { n: 4, title: "Tallenna huoltokirjaan", desc: "Työn jälkeen syötät tehdyn työn tiedot ja dokumentit itse huoltokirjaan – kaikki tallessa yhdessä paikassa." },
];

const CATS = [
  "🏠 Katto & vesikatto",
  "🔧 LVI & putket",
  "⚡ Sähkötyöt",
  "🌬️ Ilmanvaihto & IV-huolto",
  "🔥 Nuohous & tulisijat",
  "🌿 Piha & salaojat",
];

const OFFERS = [
  { name: "Yritys 1", stars: "★★★★★", price: "1 200€" },
  { name: "Yritys 2", stars: "★★★★☆", price: "1 450€" },
  { name: "Yritys 3", stars: "★★★★★", price: "980€" },
];

function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 80);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

    const cats = document.querySelectorAll<HTMLDivElement>(".kil-cat");
    const handler = (e: Event) => {
      cats.forEach((c) => c.classList.remove("active"));
      (e.currentTarget as HTMLElement).classList.add("active");
    };
    cats.forEach((c) => c.addEventListener("click", handler));
    return () => {
      observer.disconnect();
      cats.forEach((c) => c.removeEventListener("click", handler));
    };
  }, []);

  return (
    <div className="kv-page">
      <style>{STYLES}</style>

      <nav className="kv-nav">
        <div className="nav-logo">Koti<span>vahti</span></div>
        <div className="nav-links">
          <a href="#ominaisuudet">Ominaisuudet</a>
          <a href="#kilpailutus">Kilpailutus</a>
          <Link to="/rekisteroidy" className="nav-cta">Aloita ilmaiseksi</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-badge">Uutta · Ilmainen talokirja</div>
            <h1>
              Yksi sovellus –
              <em>koko talon hallinta.</em>
            </h1>
            <p className="hero-sub">
              Talokirja, vuosikello, kulujenseuranta, PTS-suunnitelma ja palveluiden kilpailutus – kaikki samassa paikassa.
            </p>
            <div className="hero-actions">
              <Link to="/rekisteroidy" className="btn-primary">
                Avaa talokirja ilmaiseksi →
              </Link>
              <div className="hero-trust">
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="mock-card">
              <div className="mock-header">
                <div>
                  <div className="mock-title">Kotivahti</div>
                  <div className="mock-address">Koivutie 12 · Kuopio</div>
                </div>
              </div>
              <div className="mock-tasks">
                <div className="mock-task done"><span className="check-done">✓</span> IV-suodattimet</div>
                <div className="mock-task done"><span className="check-done">✓</span> Räystäskourut puhdistettu</div>
                <div className="mock-task"><div className="check-todo" /> Katon tarkastus</div>
                <div className="mock-task"><div className="check-todo" /> Vikavirtasuojan testaus</div>
              </div>
              <div className="mock-costs">
                <div className="mock-cost"><div className="mock-cost-val">2 480€</div><div className="mock-cost-label">Sähkö</div></div>
                <div className="mock-cost"><div className="mock-cost-val">380€</div><div className="mock-cost-label">Vesi</div></div>
                <div className="mock-cost"><div className="mock-cost-val">4 200€</div><div className="mock-cost-label">Lämpö</div></div>
              </div>
              <div className="mock-pts">
                <div className="mock-pts-label">⚠ Seuraava PTS-toimenpide</div>
                <div className="mock-pts-title">Ilmanvaihtokone – huolto</div>
                <div className="mock-pts-sub">Suositellaan 2027 · Asennettu 2005, kanavat puhdistamatta 12v</div>
                <div className="mock-pts-btns">
                  <button className="mock-pts-btn">Tilaa kuntoarvio</button>
                  <button className="mock-pts-btn-ghost">Tarjouspyyntö: IV-kanavien puhdistus</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="features-strip">
        <div className="features-strip-inner">
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Ilmainen</strong> kaikille ominaisuuksille</div>
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Tarkastettu</strong> ammattilaisten verkosto</div>
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Automaattiset</strong> muistutukset huolloista</div>
          <div className="strip-item"><span className="strip-dot">✦</span> <strong>Myyntiraportti</strong> yksi nappi</div>
        </div>
      </div>

      <section className="features" id="ominaisuudet">
        <div className="features-inner">
          <div className="features-head animate-on-scroll">
            <div className="section-label">Ominaisuudet</div>
            <h2 className="section-h2">Kaikki mitä talo tarvitsee<br /><em>– yhdessä.</em></h2>
            <p className="section-lead">Seitsemän toimintoa jotka tekevät talostasi hyvin hoidetun – automaattisesti ja ilman vaivaa.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className={`feat-card animate-on-scroll${f.highlight ? " highlight" : ""}`}>
                {f.tag && <div className="feat-tag">{f.tag}</div>}
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="kilpailutus" id="kilpailutus">
        <div className="kilpailutus-inner">
          <div>
            <div className="section-label" style={{ color: "var(--kulta-light)" }}>
              Palveluiden kilpailutus
            </div>
            <h2 className="section-h2">Ammattilainen paikalle –<br /><em>helposti ja nopeasti.</em></h2>
            <p className="section-lead">Tilaa suoraan sovelluksesta. Kotivahti välittää pyyntösi tarkastettuihin paikallisiin yrityksiin ja sinä valitset parhaan tarjouksen.</p>
            <div className="kil-steps">
              {STEPS.map((s) => (
                <div className="kil-step" key={s.n}>
                  <div className="kil-num">{s.n}</div>
                  <div>
                    <div className="kil-step-title">{s.title}</div>
                    <div className="kil-step-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="kil-mock animate-on-scroll">
            <div className="kil-mock-title">Tilaa palvelu</div>
            <div className="kil-mock-sub">Valitse kategoria – loput hoituu automaattisesti</div>
            <div className="kil-cats">
              {CATS.map((c, i) => (
                <div key={c} className={`kil-cat${i === 0 ? " active" : ""}`}>{c}</div>
              ))}
            </div>
            <hr className="kil-divider" />
            <div className="kil-result">
              <div className="kil-result-label">Paikalliset tarjoukset – Kuopio</div>
              <div className="kil-offers">
                {OFFERS.map((o) => (
                  <div className="kil-offer" key={o.name}>
                    <div>
                      <div className="kil-offer-name">{o.name}</div>
                      <div className="kil-offer-stars">{o.stars}</div>
                    </div>
                    <div className="kil-offer-price">{o.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof">
        <div className="proof-inner">
          <div className="proof-head animate-on-scroll">
            <div className="section-label">Miksi Kotivahti</div>
            <h2 className="section-h2">Talosi tiedot vihdoin<br /><em>järjestyksessä.</em></h2>
          </div>
          <div className="stats-row">
            <div className="stat-box animate-on-scroll"><div className="stat-val">7<span>+</span></div><div className="stat-label">toimintoa yhdessä sovelluksessa</div></div>
            <div className="stat-box animate-on-scroll"><div className="stat-val">0<span>€</span></div><div className="stat-label">kaikki ominaisuudet ilmaiseksi</div></div>
            <div className="stat-box animate-on-scroll"><div className="stat-val">14<span>+</span></div><div className="stat-label">ammattilaiskategoriaa kilpailutuksessa</div></div>
            <div className="stat-box animate-on-scroll"><div className="stat-val">1<span>min</span></div><div className="stat-label">käyttöönotto alle minuutissa</div></div>
          </div>
        </div>
      </section>

      <section className="cta-section" id="aloita">
        <div className="cta-section-inner">
          <div className="section-label">Aloita tänään</div>
          <h2>Avaa talokirja.<br /><em>Ilmaiseksi.</em></h2>
          <p>Kaikki ominaisuudet heti käytössä. Ei luottokorttia eikä sitoumuksia.</p>
          <div className="cta-checks">
            <div className="cta-check">Kaikki ominaisuudet ilmaisia</div>
            <div className="cta-check">Ei luottokorttia eikä sitoumuksia</div>
            <div className="cta-check">Käyttöönotto alle minuutissa</div>
          </div>
          <Link to="/rekisteroidy" className="btn-primary" style={{ margin: "0 auto", fontSize: "1.1rem", padding: "1.1rem 2.8rem" }}>
            Aloita nyt – ilmaiseksi →
          </Link>
        </div>
      </section>

      <footer className="kv-footer">
        <p style={{ marginBottom: "0.6rem" }}>
          <a href="/ukk" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", marginRight: "1.2rem" }}>UKK</a>
          <a href="/opas" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", marginRight: "1.2rem" }}>Oppaat</a>
          <a href="/kayttoehdot" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none", marginRight: "1.2rem" }}>Käyttöehdot</a>
          <a href="/tietosuoja" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>Tietosuoja</a>
        </p>
        <p>© 2026 <span>Kotivahti</span> · Talosi oma avustaja · Kuopio, Suomi</p>
      </footer>
    </div>
  );
}
