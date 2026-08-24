import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://kotiluotsi.fi";
const URL = `${SITE}/blogi/sahkoinen-talokirja`;

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

.kv-footer { background: var(--vihrea-dark); padding: 2rem 3rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.8rem; border-top: 1px solid rgba(255,255,255,0.06); }
.kv-footer a { color: rgba(255,255,255,0.55); text-decoration: none; margin-right: 1.2rem; transition: color 0.2s; }
.kv-footer a:hover { color: var(--kulta-light); }
.kv-footer span { color: var(--kulta); opacity: 0.7; }

.blog-main { padding: 7rem 1.5rem 5rem; }
.blog-inner { max-width: 780px; margin: 0 auto; }

.blog-breadcrumb { font-size: 0.8rem; color: var(--harmaa); margin-bottom: 1.5rem; }
.blog-breadcrumb a { color: var(--vihrea); text-decoration: none; }
.blog-breadcrumb a:hover { color: var(--kulta); }
.blog-breadcrumb span { color: var(--kulta); margin: 0 0.4rem; }

.blog-meta { display: flex; gap: 1rem; font-size: 0.85rem; color: var(--harmaa); margin-bottom: 2rem; }
.blog-meta time { color: var(--vihrea); font-weight: 500; }

.blog-article h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.15; color: var(--vihrea); margin-bottom: 1.5rem; }
.blog-article h2 { font-family: 'Playfair Display', serif; font-size: clamp(1.4rem, 2.5vw, 1.9rem); color: var(--vihrea); margin-top: 2.5rem; margin-bottom: 1rem; }
.blog-article p { font-size: 1.02rem; line-height: 1.8; color: var(--teksti); margin-bottom: 1.2rem; }
.blog-article ul { margin: 1rem 0 1.5rem 1.5rem; }
.blog-article li { font-size: 1rem; line-height: 1.7; margin-bottom: 0.6rem; color: var(--teksti); }
.blog-article strong { color: var(--vihrea); }

.blog-cta { margin-top: 4rem; padding: 2.5rem; background: var(--vihrea-dark); border-radius: 14px; text-align: center; position: relative; overflow: hidden; }
.blog-cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,151,58,0.1) 0%, transparent 70%); }
.blog-cta h3 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--valkoinen); margin-bottom: 0.6rem; position: relative; }
.blog-cta p { color: rgba(255,255,255,0.65); margin-bottom: 1.5rem; position: relative; }
.blog-cta .cta-btn { display: inline-block; background: var(--kulta); color: #fff; text-decoration: none; font-weight: 600; font-size: 0.95rem; padding: 0.9rem 2rem; border-radius: 8px; transition: background 0.2s; position: relative; }
.blog-cta .cta-btn:hover { background: #b8842e; }

@media (max-width: 640px) {
  .kv-nav { padding: 1rem 1.5rem; }
  .nav-links { gap: 1rem; }
  .blog-main { padding-top: 6rem; }
}
`;

export const Route = createFileRoute("/blogi/sahkoinen-talokirja")({
  component: BlogiPage,
  head: () => ({
    meta: [
      { title: "Sähköinen talokirja – mitä, milloin ja kuka? — Kotiluotsi" },
      { name: "description", content: "Mikä on sähköinen talokirja, miten se toimii omakotitalossa ja miksi se säästää rahaa sekä vaivaa? Lue Kotiluotsin blogi." },
      { property: "og:title", content: "Sähköinen talokirja – mitä, milloin ja kuka?" },
      { property: "og:description", content: "Mikä on sähköinen talokirja, miten se toimii omakotitalossa ja miksi se säästää rahaa sekä vaivaa?" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Sähköinen talokirja – mitä, milloin ja kuka?",
          description: "Mikä on sähköinen talokirja, miten se toimii omakotitalossa ja miksi se säästää rahaa sekä vaivaa?",
          datePublished: "2026-08-24",
          dateModified: "2026-08-24",
          author: { "@type": "Organization", name: "Kotiluotsi" },
          publisher: { "@type": "Organization", name: "Kotiluotsi" },
          mainEntityOfPage: URL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Kotiluotsi", item: SITE },
            { "@type": "ListItem", position: 2, name: "Blogi", item: `${SITE}/blogi` },
            { "@type": "ListItem", position: 3, name: "Sähköinen talokirja", item: URL },
          ],
        }),
      },
    ],
  }),
});

function BlogiPage() {
  return (
    <div className="kv-page">
      <style>{STYLES}</style>

      <nav className="kv-nav">
        <a href="/" className="nav-logo">Koti<span>luotsi</span></a>
        <div className="nav-links">
          <a href="/#ominaisuudet">Ominaisuudet</a>
          <a href="/#kilpailutus">Kilpailutus</a>
          <Link to="/rekisteroidy" className="nav-cta">Aloita ilmaiseksi</Link>
        </div>
      </nav>

      <main className="blog-main">
        <div className="blog-inner">
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Kotiluotsi</a>
            <span>›</span>
            <a href="/blogi">Blogi</a>
            <span>›</span>
            <span>Sähköinen talokirja</span>
          </nav>

          <div className="blog-meta">
            <time dateTime="2026-08-24">Elokuu 2026</time>
            <span>Lukuaika: ~4 min</span>
          </div>

          <article className="blog-article">
            <h1>Sähköinen talokirja – mitä, milloin ja kuka?</h1>

            <h2>Tuttu tilanne omakotitalossa</h2>
            <p>
              Onko sinullakin talon tiedot hajallaan – osa muistitikulla, osa paperisessa mapissa ja osa vain muistissa?
              Et ole yksin. Tämä on omakotitaloasujien arkipäivää ympäri Suomen.
            </p>
            <p>
              Milloin katto olikaan tarkastettu viimeksi? Onko ilmanvaihtokanavat puhdistettu koskaan?
              Kuka huolsi lämmityskattilan ja milloin? Mitä takuupapereita jäi kylpyhuoneremontin jälkeen?
            </p>
            <p>
              Nämä kysymykset nousevat esiin aina kun talossa pitää tehdä jotain – tai kun se laitetaan myyntiin.
              Perinteisesti talon tiedot elävät paperisessa kansiossa, edellisen omistajan muistissa tai
              parhaimmillaan muistitikulla. Uudemmissa taloissa saatetaan käyttää sähköistä talokirjaa, mutta
              sekin on usein hajanainen kokonaisuus.
            </p>
            <p>
              Tällainen tilanne on paitsi yleinen, myös kallis. Kun talon huoltohistoria ei ole tallessa,
              reagoidaan ongelmiin vasta kun ne ovat jo syntyneet. Kiirehuollot maksavat enemmän.
              Ennaltaehkäistävät vauriot kasvavat isoiksi vahingoiksi. Ja myyntitilanteessa dokumentoimaton
              talo herättää ostajassa epäluottamusta.
            </p>

            <h2>Mitä sähköinen talokirja tarkoittaa käytännössä?</h2>
            <p>
              Sähköinen talokirja kokoaa omakotitalon kaikki tiedot yhteen paikkaan digitaalisesti:
            </p>
            <ul>
              <li>Talon perustiedot ja rakennusosat</li>
              <li>Talotekniikan tiedot ja huoltohistoria</li>
              <li>Tehdyt remontit ja tarkastukset tekijöineen</li>
              <li>Kuitit, takuupaperit ja dokumentit</li>
              <li>Energiankulutus vuositasolla</li>
              <li>Kotitalousvähennykset eriteltynä</li>
            </ul>
            <p>
              Kun kaikki on yhdessä paikassa, löydät aina mitä tarvitset – oli kyseessä sitten
              ammattilaisen kysymys, vakuutuskorvaus tai kiinteistönvälittäjän tietopyyntö.
            </p>

            <h2>Ennakoiva huolto säästää rahaa</h2>
            <p>
              Omakotitalo on kokonaisuus, jossa jokaisella rakennusosalla on oma käyttöikänsä.
              Kun nämä tiedot ovat tallessa, voit ennakoida tulevat huoltotarpeet sen sijaan että reagoit
              yllätyksiin. Pitkän tähtäimen suunnitelma – PTS – kertoo seuraavan 10 vuoden huoltotarpeet
              yhdellä silmäyksellä.
            </p>
            <p>Vuosikello puolestaan muistuttaa kausittaisista perushuolloista oikeaan aikaan:</p>
            <ul>
              <li><strong>Kevät:</strong> Katon tarkastus, salaojien lietepesät, räystäskourut</li>
              <li><strong>Kesä:</strong> Julkisivun kuntokierros, nuohous, terassin hoito</li>
              <li><strong>Syksy:</strong> Lämmityksen käynnistys, palovaroittimet, ulkovesipisteen sulku</li>
              <li><strong>Talvi:</strong> Lumikuorma, kattoturvatuotteiden tarkistus, jään muodostuminen</li>
            </ul>
            <p>
              Kun huollot tehdään oikeaan aikaan, vältytään kalliilta vaurioilta ja omakotitalo pysyy
              arvonsa säilyttävänä omaisuutena vuosikymmeniä eteenpäin.
            </p>

            <h2>Myyntitilanne ja tiedon siirtäminen</h2>
            <p>
              Kun talo vaihtaa omistajaa, sähköinen talokirja on merkittävä etu. Uusi omistaja saa
              kattavan kuvan talon historiasta, huolloista ja tulevista remonteista – ilman arvailuja.
              Myyntiasiakirjoihin liitettävä raportti vahvistaa talon hoidetun tilan ja nopeuttaa kauppaa.
            </p>

            <h2>Kenelle sähköinen talokirja sopii?</h2>
            <p>
              Sähköinen talokirja sopii jokaiselle omakotitalon omistajalle riippumatta talon iästä tai
              koosta. Se on erityisen hyödyllinen, jos talossa on useita järjestelmiä, omistaja vaihtuu
              lähitulevaisuudessa tai halutaan pitää kulut ja huollat kurissa.
            </p>

            <h2>Mistä aloittaa?</h2>
            <p>
              Aloittaminen on yksinkertaista: syötä talon perustiedot, lisää tunnetut huolto- ja remonttitiedot
              sekä liitä tärkeät dokumentit. Sen jälkeen Kotiluotsi huolehtii muistutuksista, PTS-suunnitelmasta
              ja kulujen seurannasta puolestasi.
            </p>

            <div className="blog-cta">
              <h3>Valmis aloittamaan?</h3>
              <p>Käyttöönotto vie muutaman minuutin ja palvelu on maksuton.</p>
              <Link to="/rekisteroidy" className="cta-btn">Aloita ilmaiseksi →</Link>
            </div>
          </article>
        </div>
      </main>

      <footer className="kv-footer">
        <p style={{ marginBottom: "0.6rem" }}>
          <a href="/blogi">Blogi</a>
          <a href="/ukk">UKK</a>
          <a href="/opas">Oppaat</a>
          <a href="/kayttoehdot">Käyttöehdot</a>
          <a href="/tietosuoja">Tietosuoja</a>
        </p>
        <p>© 2026 <span>Kotiluotsi</span> · Talosi oma avustaja · Suomi</p>
      </footer>
    </div>
  );
}
