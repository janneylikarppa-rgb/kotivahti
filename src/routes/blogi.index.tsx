import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://kotiluotsi.fi";
const URL = `${SITE}/blogi`;

const POSTS = [
  {
    href: "/blogi/pts-suunnitelma",
    tag: "Artikkeli",
    title: "Pitkän tähtäimen suunnitelma – miksi omakotitalon ennakoiva huolto kannattaa",
    ingress:
      "Omakotitalossa on yllättävän paljon asioita, jotka pitäisi muistaa. PTS-suunnitelma auttaa ennakoimaan tulevat huollot ajoissa.",
    date: "Syyskuu 2026",
    readTime: "~5 min",
    dateTime: "2026-09-11",
  },
  {
    href: "/blogi/sahkoinen-talokirja",
    tag: "Artikkeli",
    title: "Sähköinen talokirja – mitä, milloin ja kuka?",
    ingress:
      "Mikä on sähköinen talokirja, miten se toimii omakotitalossa ja miksi se säästää rahaa sekä vaivaa?",
    date: "Elokuu 2026",
    readTime: "~4 min",
    dateTime: "2026-08-24",
  },
];

const STYLES = `
:root {
  --vihrea: #1e3a2f;
  --vihrea-dark: #152a22;
  --kulta: #c8973a;
  --kulta-light: #e4b96a;
  --kerma: #f5f0e8;
  --teksti: #1a1a1a;
  --harmaa: #6b6b6b;
  --valkoinen: #ffffff;
}
.kv-page * { margin: 0; padding: 0; box-sizing: border-box; }
.kv-page { font-family: 'DM Sans', sans-serif; background: var(--kerma); color: var(--teksti); overflow-x: hidden; min-height: 100vh; }

.kv-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 3rem; background: rgba(245,240,232,0.92); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(200,151,58,0.15); }
.nav-logo { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--vihrea); letter-spacing: -0.5px; text-decoration: none; }
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
.blog-inner { max-width: 1000px; margin: 0 auto; }

.blog-breadcrumb { font-size: 0.8rem; color: var(--harmaa); margin-bottom: 1.5rem; }
.blog-breadcrumb a { color: var(--vihrea); text-decoration: none; }
.blog-breadcrumb a:hover { color: var(--kulta); }
.blog-breadcrumb span { color: var(--kulta); margin: 0 0.4rem; }

.blog-index h1 { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1.15; color: var(--vihrea); margin-bottom: 0.8rem; }
.blog-index > p { font-size: 1.02rem; line-height: 1.7; color: var(--harmaa); margin-bottom: 3rem; max-width: 620px; }

.blog-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.6rem; }
.blog-card { display: block; background: var(--valkoinen); border: 1px solid rgba(30,58,47,0.08); border-radius: 16px; padding: 2rem; text-decoration: none; transition: transform 0.25s, box-shadow 0.25s; }
.blog-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(30,58,47,0.25); }
.blog-card .tag { display: inline-block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--kulta); background: rgba(200,151,58,0.1); padding: 0.3rem 0.8rem; border-radius: 999px; margin-bottom: 1.1rem; }
.blog-card h2 { font-family: 'Playfair Display', serif; font-size: 1.35rem; line-height: 1.3; color: var(--vihrea); margin-bottom: 0.8rem; }
.blog-card .ingress { font-size: 0.95rem; line-height: 1.65; color: var(--harmaa); margin-bottom: 1.2rem; }
.blog-card .meta { display: flex; gap: 0.8rem; font-size: 0.8rem; color: var(--harmaa); margin-bottom: 1.2rem; }
.blog-card .meta time { color: var(--vihrea); font-weight: 500; }
.blog-card .read { font-size: 0.9rem; font-weight: 600; color: var(--kulta); }

@media (max-width: 640px) {
  .kv-nav { padding: 1rem 1.5rem; }
  .nav-links { gap: 1rem; }
  .blog-main { padding-top: 6rem; }
}
`;

export const Route = createFileRoute("/blogi/")({
  component: BlogiIndexPage,
  head: () => ({
    meta: [
      { title: "Blogi – ajankohtaista omakotitalon ylläpidosta | Kotiluotsi" },
      {
        name: "description",
        content:
          "Kotiluotsin blogi: käytännön vinkkejä omakotitalon huoltoon, PTS-suunnitteluun ja talon tiedonhallintaan.",
      },
      { property: "og:title", content: "Blogi – ajankohtaista omakotitalon ylläpidosta | Kotiluotsi" },
      {
        property: "og:description",
        content:
          "Käytännön vinkkejä omakotitalon huoltoon, PTS-suunnitteluun ja talon tiedonhallintaan.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Kotiluotsi", item: SITE },
            { "@type": "ListItem", position: 2, name: "Blogi", item: URL },
          ],
        }),
      },
    ],
  }),
});

function BlogiIndexPage() {
  return (
    <div className="kv-page">
      <style>{STYLES}</style>

      <nav className="kv-nav">
        <a href="/" className="nav-logo">
          Koti<span>luotsi</span>
        </a>
        <div className="nav-links">
          <a href="/#ominaisuudet">Ominaisuudet</a>
          <a href="/#kilpailutus">Kilpailutus</a>
          <Link to="/rekisteroidy" className="nav-cta">
            Aloita ilmaiseksi
          </Link>
        </div>
      </nav>

      <main className="blog-main">
        <div className="blog-inner blog-index">
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Kotiluotsi</a>
            <span>›</span>
            <span>Blogi</span>
          </nav>

          <h1>Blogi</h1>
          <p>
            Käytännön vinkkejä omakotitalon huoltoon, ennakoivaan PTS-suunnitteluun ja talon
            tiedonhallintaan.
          </p>

          <div className="blog-cards">
            {POSTS.map((post) => (
              <a key={post.href} href={post.href} className="blog-card">
                <span className="tag">{post.tag}</span>
                <h2>{post.title}</h2>
                <p className="ingress">{post.ingress}</p>
                <div className="meta">
                  <time dateTime={post.dateTime}>{post.date}</time>
                  <span>Lukuaika: {post.readTime}</span>
                </div>
                <span className="read">Lue artikkeli →</span>
              </a>
            ))}
          </div>
        </div>
      </main>

      <footer className="kv-footer">
        <a href="/tietosuoja">Tietosuoja</a>
        <a href="/kayttoehdot">Käyttöehdot</a>
        <a href="/ukk">UKK</a>
        <p style={{ marginTop: "0.8rem" }}>
          © 2026 <span>Kotiluotsi</span>. Kaikki oikeudet pidätetään.
        </p>
      </footer>
    </div>
  );
}
