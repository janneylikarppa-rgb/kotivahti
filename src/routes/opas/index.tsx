import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://kotivahti.fi";

const OPPAAT = [
  {
    slug: "nuohous-hinta",
    title: "Nuohouksen hinta ja oikea ajankohta",
    teaser: "Mitä nuohous maksaa, kuinka usein se on tehtävä ja milloin kannattaa varata aika — kevät vai syksy?",
  },
  {
    slug: "iv-puhdistus",
    title: "Ilmanvaihdon puhdistus ja IV-suodattimet",
    teaser: "Milloin ilmanvaihtokanavat pitää puhdistaa, kuinka usein suodattimet vaihdetaan ja mikä on hinta-arvio.",
  },
  {
    slug: "katon-tarkastus",
    title: "Katon tarkastus — mitä, miten ja milloin",
    teaser: "Säännöllinen katon tarkastus säästää tuhansia. Mitä ammattilainen tarkistaa ja kuinka usein.",
  },
];

export const Route = createFileRoute("/opas/")({
  component: OpasIndex,
  head: () => ({
    meta: [
      { title: "Talon huolto-oppaat — Kotivahti" },
      { name: "description", content: "Konkreettisia oppaita omakotitalon vuosihuoltoihin: nuohous, ilmanvaihto, katon tarkastus ja paljon muuta." },
      { property: "og:title", content: "Talon huolto-oppaat — Kotivahti" },
      { property: "og:description", content: "Konkreettisia oppaita omakotitalon vuosihuoltoihin." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/opas` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/opas` }],
  }),
});

function OpasIndex() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-20">
      <p className="eyebrow mb-3">Oppaat</p>
      <h1 className="font-serif text-4xl text-cream md:text-5xl">Talon huolto-oppaat</h1>
      <p className="mt-4 max-w-2xl text-cream/70">
        Konkreettisia oppaita omakotitalon vuosihuoltoihin — mitä tehdään itse, milloin tarvitaan ammattilainen ja mihin hinta perustuu.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {OPPAAT.map((o) => (
          <Link
            key={o.slug}
            to="/opas/$slug"
            params={{ slug: o.slug }}
            className="block rounded-lg border border-cream/10 bg-cream/5 p-5 transition hover:border-[color:var(--kulta)]/40 hover:bg-cream/10"
          >
            <h2 className="font-serif text-xl text-cream">{o.title}</h2>
            <p className="mt-2 text-sm text-cream/70">{o.teaser}</p>
            <span className="mt-3 inline-block text-sm text-[color:var(--kulta)]">Lue opas →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
