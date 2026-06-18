// Yhteinen layout opassivuille — Article + FAQPage JSON-LD.

import { type ReactNode } from "react";

export type FaqItem = { q: string; a: string };

export type OpasSisalto = {
  title: string;
  description: string;
  slug: string;
  julkaistu: string; // ISO
  intro: ReactNode;
  osiot: { otsikko: string; sisalto: ReactNode }[];
  faq: FaqItem[];
};

export const OPAS_SITE = "https://kotivahti.fi";

export function opasHead(o: OpasSisalto) {
  const url = `${OPAS_SITE}/opas/${o.slug}`;
  return {
    meta: [
      { title: `${o.title} — Kotivahti` },
      { name: "description", content: o.description },
      { property: "og:title", content: o.title },
      { property: "og:description", content: o.description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: o.title,
          description: o.description,
          datePublished: o.julkaistu,
          author: { "@type": "Organization", name: "Kotivahti" },
          publisher: { "@type": "Organization", name: "Kotivahti" },
          mainEntityOfPage: url,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: o.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  };
}

export function OpasLayout({ o }: { o: OpasSisalto }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <p className="eyebrow mb-3">
        <a href="/opas" className="text-cream/60 hover:text-cream">Oppaat</a>
      </p>
      <h1 className="font-serif text-4xl text-cream md:text-5xl">{o.title}</h1>
      <p className="mt-4 text-lg text-cream/75">{o.description}</p>

      <article className="prose-opas mt-10 space-y-6 text-cream/80">
        {o.intro}
        {o.osiot.map((s) => (
          <section key={s.otsikko} className="space-y-3">
            <h2 className="font-serif text-2xl text-cream">{s.otsikko}</h2>
            <div className="space-y-3 text-sm leading-relaxed">{s.sisalto}</div>
          </section>
        ))}
      </article>

      <section className="mt-12 space-y-4">
        <h2 className="font-serif text-2xl text-cream">Usein kysytyt kysymykset</h2>
        {o.faq.map((f) => (
          <details key={f.q} className="rounded-lg border border-cream/10 bg-cream/5 p-4">
            <summary className="cursor-pointer font-medium text-cream">{f.q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">{f.a}</p>
          </details>
        ))}
      </section>

      <aside className="mt-12 rounded-lg border border-[color:var(--kulta)]/30 bg-[color:var(--kulta)]/5 p-6 text-center">
        <p className="text-cream">
          Kotivahti pitää talosi huoltohistorian, kulut ja PTS-suunnitelman yhdessä paikassa — ja muistuttaa oikealla hetkellä.
        </p>
        <a href="/rekisteroidy" className="mt-4 inline-block rounded-md bg-[color:var(--kulta)] px-6 py-2.5 font-semibold text-[#0D1F14]">
          Aloita maksutta
        </a>
      </aside>
    </main>
  );
}
