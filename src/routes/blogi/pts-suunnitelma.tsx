import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://kotiluotsi.fi";
const URL = `${SITE}/blogi/pts-suunnitelma`;

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
.blog-article h3 { font-family: 'Playfair Display', serif; font-size: clamp(1.15rem, 2vw, 1.4rem); color: var(--vihrea); margin-top: 1.8rem; margin-bottom: 0.7rem; }
.blog-article p { font-size: 1.02rem; line-height: 1.8; color: var(--teksti); margin-bottom: 1.2rem; }
.blog-article strong { color: var(--vihrea); }

.blog-cta { margin-top: 4rem; padding: 2.5rem; background: var(--vihrea-dark); border-radius: 14px; text-align: center; position: relative; overflow: hidden; }
.blog-cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 80% at 50% 50%, rgba(200,151,58,0.1) 0%, transparent 70%); }
.blog-cta h3 { font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--valkoinen); margin-bottom: 0.6rem; position: relative; }
.blog-cta p { color: rgba(255,255,255,0.65); margin-bottom: 1.5rem; position: relative; }
.blog-cta .cta-btn { display: inline-block; background: var(--kulta); color: #fff; text-decoration: none; font-weight: 600; font-size: 0.95rem; padding: 0.9rem 2rem; border-radius: 8px; transition: background 0.2s; position: relative; }
.blog-cta .cta-btn:hover { background: #b8842e; }

.read-more { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid rgba(0,0,0,0.08); }
.read-more-label { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--harmaa); font-weight: 600; margin-bottom: 0.8rem; }
.read-more a { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--kulta); font-weight: 600; text-decoration: none; transition: gap 0.2s; }
.read-more a:hover { gap: 0.7rem; }

@media (max-width: 640px) {
  .kv-nav { padding: 1rem 1.5rem; }
  .nav-links { gap: 1rem; }
  .blog-main { padding-top: 6rem; }
}
`;

export const Route = createFileRoute("/blogi/pts-suunnitelma")({
  component: BlogiPage,
  head: () => ({
    meta: [
      { title: "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa | Kotiluotsi" },
      { name: "description", content: "PTS-suunnitelma kertoo milloin omakotitalon katto, julkisivu, ilmanvaihto ja muut rakennusosat tarvitsevat huoltoa. Ennakoi ajoissa ja vältä yllätykset." },
      { property: "og:title", content: "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa" },
      { property: "og:description", content: "PTS-suunnitelma kertoo milloin omakotitalon katto, julkisivu, ilmanvaihto ja muut rakennusosat tarvitsevat huoltoa. Ennakoi ajoissa ja vältä yllätykset." },
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
          headline: "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa",
          description: "PTS-suunnitelma kertoo milloin omakotitalon katto, julkisivu, ilmanvaihto ja muut rakennusosat tarvitsevat huoltoa. Ennakoi ajoissa ja vältä yllätykset.",
          datePublished: "2026-09-11",
          dateModified: "2026-09-11",
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
            { "@type": "ListItem", position: 3, name: "PTS-suunnitelma", item: URL },
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
            <span>PTS-suunnitelma</span>
          </nav>

          <div className="blog-meta">
            <time dateTime="2026-09-11">Syyskuu 2026</time>
            <span>Artikkeli · Lukuaika: ~5 min</span>
          </div>

          <article className="blog-article">
            <h1>Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa</h1>

            <p>
              Milloin viimeksi ajattelit talosi kattoa? Entä ilmanvaihtoa? Tai sitä, koska ulkoverhous on maalattu viimeksi?
              Omakotitalossa on yllättävän paljon asioita, jotka pitäisi muistaa. Osa huolloista tulee vastaan vuosittain,
              osa muutaman vuoden välein ja osa vasta vuosikymmenten päästä. Kaikkea ei voi eikä tarvitse muistaa ulkoa.
            </p>
            <p>
              Useimmille meistä talon huolto tarkoittaa helposti reagoimista – kun jokin rikkoutuu, se korjataan. Mutta voisiko
              omakotitalon ylläpitoa ajatella myös toisella tavalla? Ennakoimalla voit pitää talon kunnossa rauhallisemmin,
              varautua tuleviin kustannuksiin ja ennen kaikkea välttää tilanteen, jossa pieni huoltotarve muuttuu kiireelliseksi remontiksi.
              Tähän juuri pitkän tähtäimen suunnitelma eli PTS on tehty.
            </p>

            <h2>Mitä PTS tarkoittaa käytännössä?</h2>
            <p>
              PTS kuulostaa ehkä rakennusalan termiltä, mutta käytännössä kyse on hyvin yksinkertaisesta asiasta: tiedät, mitä
              talollesi pitäisi tehdä ja milloin. Katto, julkisivu, ilmanvaihto, lämmitysjärjestelmä, putkistot ja märkätilat
              kuluvat kaikki aikanaan. Jokaisella rakennusosalla on oma käyttöikänsä – mutta tarkkaa ajankohtaa huollolle tai
              uusimiselle ei voi määrittää pelkän kalenterin perusteella.
            </p>
            <p>
              Siksi PTS:n arvo on siinä, että tulevia tarpeita voi tarkastella kokonaisuutena. Mitä talolle pitäisi tehdä tänä vuonna?
              Entä kolmen tai viiden vuoden päästä? Onko tiedossa suurempi remontti, johon olisi hyvä alkaa varautua jo nyt?
              Kun tiedät vastaukset etukäteen, ylläpidosta tulee huomattavasti hallitumpaa.
            </p>

            <h2>Kolme esimerkkiä ennakoivasta talon huollosta</h2>

            <h3>Katon huolto ja tarkastus</h3>
            <p>
              Katto on yksi omakotitalon tärkeimmistä suojista. Siksi sen kuntoa kannattaa seurata säännöllisesti – eikä vasta
              silloin, kun sisällä näkyy ensimmäinen vesijälki. Katon tarkastuksessa voidaan huomata esimerkiksi kulumia, vaurioita,
              ruostetta, läpivientien ongelmia tai puhdistusta vaativia kohtia. Kun mahdollinen ongelma havaitaan ajoissa, sen
              korjaaminen voidaan yleensä suunnitella rauhassa.
            </p>
            <p><strong>Kysy itseltäsi: milloin oman talosi katto on viimeksi tarkastettu?</strong></p>

            <h3>Talon maalaus ja julkisivu</h3>
            <p>
              Julkisivu on kodin näkyvin pinta, mutta sen tehtävä ei ole vain näyttää hyvältä. Maalipinta ja julkisivurakenteet
              suojaavat rakennusta myös sääolosuhteilta. Kun talon maalaus tulee ajankohtaiseksi, kannattaa samalla tarkastella
              julkisivun yleistä kuntoa. Onko maalipinta kulunut? Näkyykö halkeamia tai muita vaurioita? Kaipaavatko jotkin kohdat
              korjausta ennen maalaamista?
            </p>
            <p>
              Ennakoiva huolto voi pidentää rakenteiden käyttöikää ja auttaa myös arvon säilymisessä. Hyvin pidetty julkisivu on
              helpompi esitellä myös tulevalle ostajalle.
            </p>

            <h3>Ilmanvaihdon puhdistus ja huolto</h3>
            <p>
              Ilmanvaihto on hyvä esimerkki asiasta, jota ei välttämättä tule ajatelleeksi ennen kuin sen toiminnassa huomaa
              jotain poikkeavaa. Suodattimien vaihto, ilmanvaihtokoneen huolto ja tarvittaessa ilmanvaihtokanavien puhdistus
              kuuluvat kodin ylläpitoon. Oikea huoltotarve ja -väli riippuvat järjestelmästä, käytöstä ja valmistajan ohjeista.
            </p>
            <p><strong>Milloin oman kotisi ilmanvaihto on viimeksi huollettu? Entä tiedätkö, milloin kanavat on viimeksi puhdistettu?</strong></p>

            <h2>Arvon säilyminen alkaa siitä, että tiedät talosi tilanteen</h2>
            <p>
              Omakotitalo on monelle yksi elämän suurimmista hankinnoista. Silti talon kunnossapito saattaa perustua pitkälti muistiin.
              "Katto taisi olla asennettu joskus 2010-luvulla." "Ilmanvaihto huollettiin… olisiko siitä viisi vuotta?"
              "Julkisivu maalattiin ennen lasten syntymää." Kuulostaako tutulta?
            </p>
            <p>
              Hyvä talokirja ja huoltohistoria muuttavat tilanteen. Kun tehdyt huollot, remontit ja tärkeät rakennustiedot ovat
              tallessa, talon kokonaisuudesta on helpompi muodostaa kuva. Se on hyödyllistä arjessa – ja erityisen arvokasta silloin,
              jos joskus päätät myydä talon. Dokumentoitu huoltohistoria kertoo konkreettisesti, että kodista on pidetty huolta.
            </p>

            <h2>Asuinmukavuus ja riskien hallinta kulkevat käsi kädessä</h2>
            <p>
              Ennakoiva talon huolto ei ole vain rahaa tai tulevaa myyntitilannetta varten. Se on myös sitä, että koti toimii silloin
              kun sen pitää. Toimiva ilmanvaihto, kunnossa oleva katto, huollettu lämmitysjärjestelmä ja ehjä julkisivu ovat asioita,
              joita ei arjessa juuri ajattele. Ja juuri niin niiden kuuluukin olla.
            </p>
            <p>
              Huollon tarkoitus ei ole pelotella mahdollisilla vahingoilla. Päinvastoin. Kun tiedät, mitä talollesi kuuluu tehdä ja milloin,
              voit suhtautua ylläpitoon rauhallisemmin. Pieni huolto oikeaan aikaan on usein helpompi asia kuin kiireessä eteen tuleva korjaus.
            </p>

            <h2>Entä jos talosi PTS olisi valmiina jo tänään?</h2>
            <p>
              Tässä kohtaa ongelma on monelle tuttu: ajatus ennakoivasta huollosta on järkevä, mutta mistä aloittaa? Mitä pitäisi
              tarkistaa tänä vuonna? Milloin seuraava suurempi huolto tulee vastaan? Miten kaikki tehdyt työt ja kuitit pysyvät tallessa?
            </p>
            <p>
              Kotiluotsi on tehty juuri tätä varten. Kotiluotsi kokoaa omakotitalon tärkeät tiedot yhteen sähköiseen talokirjaan ja
              muodostaa niiden perusteella PTS-suunnitelman, josta näet tulevien vuosien huolto- ja uusimistarpeita. Lisäksi palvelussa
              on vuosikello kausittaisille huoltotehtäville, huoltohistoria johon tehdyt työt ja dokumentit voi tallentaa sekä
              mahdollisuus tilata palvelut suoraan tarkistetuilta paikallisilta ammattilaisilta. Kun huolto tulee ajankohtaiseksi,
              apua ei tarvitse etsiä alusta asti. Käyttöönotto on maksutonta ja vie vain muutaman minuutin.
            </p>
            <p>
              Jos siis jäit tämän artikkelin alussa miettimään, milloin oma katto tarkastettiin tai koska julkisivu viimeksi maalattiin –
              olet jo oikean kysymyksen äärellä.
            </p>

            <div className="blog-cta">
              <h3>Valmis katsomaan eteenpäin?</h3>
              <p>Katso, miltä oman talosi seuraavat vuodet näyttävät.</p>
              <Link to="/rekisteroidy" className="cta-btn">Katso, miltä oman talosi seuraavat vuodet näyttävät →</Link>
              <p style={{ marginTop: "1rem", marginBottom: 0, fontSize: "0.85rem" }}>Käyttöönotto on maksutonta.</p>
            </div>

            <div className="read-more">
              <div className="read-more-label">Lue myös</div>
              <Link to="/blogi/sahkoinen-talokirja">Sähköinen talokirja – mitä, milloin ja kuka? →</Link>
            </div>
          </article>
        </div>
      </main>

      <footer className="kv-footer">
        <p style={{ marginBottom: "0.6rem" }}>
          <a href="/blogi">Blogi</a>
          <a href="/ukk">UKK</a>
          <a href="/kayttoehdot">Käyttöehdot</a>
          <a href="/tietosuoja">Tietosuoja</a>
        </p>
        <p>© 2026 <span>Kotiluotsi</span> · Talosi oma avustaja · Suomi</p>
      </footer>
    </div>
  );
}
