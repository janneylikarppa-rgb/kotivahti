import { createFileRoute, Link } from "@tanstack/react-router";

const SITE = "https://kotivahti.fi";

const KYSYMYKSET = [
  {
    q: "Mikä Kotivahti on ja onko se ilmainen?",
    a: "Kotivahti on omakotitaloasujille tarkoitettu talokirja: tallennat talon tiedot, huoltohistorian, kulut ja saat automaattisen PTS-suunnitelman (pitkän tähtäimen huoltosuunnitelma). Peruskäyttö on maksutonta — tarjoamme lisäksi kilpailutusta ammattilaisten huoltotöistä, mikä on käyttäjälle veloituksetonta.",
  },
  {
    q: "Miten talokirja toimii?",
    a: "Kun täytät talon perustiedot (rakennusvuosi, lämmitysmuoto, kattomateriaali, ikkunoiden uusimisvuosi yms.), Kotivahti laskee RT-kortiston käyttöikien ja huoltovälien perusteella mitä toimenpiteitä on luvassa lähivuosina. Kirjaat tehdyt huollot ja kulut samaan paikkaan, ja saat kausimuistutuksia (kevät/kesä/syksy/talvi).",
  },
  {
    q: "Miten ammattilaisten kilpailutus toimii?",
    a: "Kun tarvitset esimerkiksi nuohouksen, IV-puhdistuksen tai katon tarkastuksen, voit pyytää Kotivahdin kautta kuntoarvion tai tarjouksen. Pyyntö välitetään alueesi tarkastetuille ammattilaisille, jotka ottavat yhteyttä suoraan sinuun. Sinulla ei ole velvollisuutta hyväksyä mitään tarjousta.",
  },
  {
    q: "Onko pyyntö sitova? Pitääkö antaa luottokortti?",
    a: "Pyyntö ei ole sitova. Et anna maksutietoja Kotivahdille — sovit hinnasta ja työstä suoraan valitsemasi ammattilaisen kanssa.",
  },
  {
    q: "Onko Kotivahdin listaamat ammattilaiset tarkastettu?",
    a: "Kyllä. Tarkistamme verkostoomme liittyvät ammattilaiset: Y-tunnus, ennakkoperintärekisteri ja toimialakohtaiset luvat (esim. sähkö- ja LVI-pätevyydet). Käyttäjäpalaute vaikuttaa siihen, ketkä pysyvät verkostossa.",
  },
  {
    q: "Miten tietoturva on hoidettu?",
    a: "Talon tiedot, huoltohistoria ja kulut tallennetaan EU-alueen palvelimille. Vain sinä näet oman talosi tiedot — emme myy tai luovuta tietoja ulkopuolisille. Voit poistaa tilisi ja kaikki tietosi milloin tahansa.",
  },
];

export const Route = createFileRoute("/ukk")({
  component: UkkPage,
  head: () => ({
    meta: [
      { title: "Usein kysytyt kysymykset — Kotivahti" },
      { name: "description", content: "Vastauksia Kotivahdin yleisimpiin kysymyksiin: talokirja, kilpailutus, sitovuus, ammattilaisten tarkastus ja tietoturva." },
      { property: "og:title", content: "UKK — Kotivahti" },
      { property: "og:description", content: "Vastauksia Kotivahdin yleisimpiin kysymyksiin." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/ukk` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/ukk` }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: KYSYMYKSET.map((k) => ({
          "@type": "Question",
          name: k.q,
          acceptedAnswer: { "@type": "Answer", text: k.a },
        })),
      }),
    }],
  }),
});

function UkkPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-20">
      <Link to="/" className="mb-6 inline-block text-sm text-cream/60 transition hover:text-[color:var(--kulta)]">
        ← Takaisin etusivulle
      </Link>
      <p className="eyebrow mb-3">Usein kysytyt kysymykset</p>
      <h1 className="font-serif text-4xl text-cream md:text-5xl">UKK — Kotivahti</h1>
      <p className="mt-4 text-cream/70">
        Tältä sivulta löydät vastaukset Kotivahti-palvelua koskeviin yleisimpiin kysymyksiin.
        Talon huoltoon ja vuosihuoltojen ajoitukseen liittyvät oppaat löydät{" "}
        <Link to="/opas" className="text-[color:var(--kulta)] underline">Oppaat-osiosta</Link>.
      </p>
      <div className="mt-10 space-y-6">
        {KYSYMYKSET.map((k) => (
          <article key={k.q} className="rounded-lg border border-cream/10 bg-cream/5 p-5">
            <h2 className="font-serif text-xl text-cream">{k.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/75">{k.a}</p>
          </article>
        ))}
      </div>
      <div className="mt-12 rounded-lg border border-[color:var(--kulta)]/30 bg-[color:var(--kulta)]/5 p-6 text-center">
        <p className="text-cream">Aloita Kotivahdin käyttö maksutta — talokirja, PTS ja kausimuistutukset.</p>
        <Link to="/rekisteroidy" className="mt-4 inline-block rounded-md bg-[color:var(--kulta)] px-6 py-2.5 font-semibold text-[#0D1F14]">
          Rekisteröidy
        </Link>
      </div>
    </main>
  );
}
