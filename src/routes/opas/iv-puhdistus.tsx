import { createFileRoute } from "@tanstack/react-router";
import { OpasLayout, opasHead, type OpasSisalto } from "@/components/opas-layout";

const opas: OpasSisalto = {
  slug: "iv-puhdistus",
  title: "Ilmanvaihdon puhdistus ja IV-suodattimet",
  description: "Milloin ilmanvaihtokanavat pitää puhdistaa, kuinka usein suodattimet vaihdetaan ja mikä on hinta-arvio omakotitalossa.",
  julkaistu: "2026-06-18",
  intro: (
    <p>
      Ilmanvaihto on sisäilman ja energiankulutuksen kannalta talon tärkeimpiä järjestelmiä —
      ja samalla yksi laiminlyödyimpiä. Tämä opas kertoo milloin huoltoa tarvitaan, mitä voit tehdä itse
      ja mitä työ ammattilaiselta maksaa.
    </p>
  ),
  osiot: [
    {
      otsikko: "IV-suodattimet — vaihtoväli ja itsetehtävät",
      sisalto: (
        <>
          <p>
            Tavalliset IV-koneen suodattimet vaihdetaan <strong>kahdesti vuodessa</strong> — keväällä siitepöly-
            kauden jälkeen ja syksyllä ennen lämmityskauden alkua. Pölyisellä alueella tai vilkasliikenteisen
            tien varrella useammin.
          </p>
          <p>
            Vaihto on yksinkertainen: avaa huoltoluukku, vedä vanhat suodattimet pois ja asenna uudet nuolen
            osoittamaan suuntaan. Suodattimet maksavat 20–60 € parilta, riippuen suodatinluokasta.
          </p>
        </>
      ),
    },
    {
      otsikko: "Kanavien puhdistus — milloin ja paljonko maksaa",
      sisalto: (
        <>
          <p>
            Ilmanvaihtokanavat suositellaan puhdistettaviksi <strong>5–10 vuoden välein</strong>. Aikaisemmin
            kanaviston nuohous oli pakollinen 10 vuoden välein — nykylainsäädäntö perustuu kiinteistön omistajan
            vastuuseen, mutta puhdistus on edelleen voimakkaasti suositeltava.
          </p>
          <p>
            Omakotitalon kanaviston puhdistus maksaa tyypillisesti 400–900 € sisältäen ALV:n. Hinta nousee
            jos kanavisto on monimutkainen tai kanavat ovat poikkeuksellisen likaiset. Samassa käynnissä
            tarkistetaan usein LTO-kennon kunto.
          </p>
        </>
      ),
    },
    {
      otsikko: "Mistä tunnistat puhdistustarpeen",
      sisalto: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tunkkainen sisäilma, hajut eivät poistu</li>
            <li>Pölyyntyvät pinnat normaalia nopeammin</li>
            <li>IV-koneen ääni on muuttunut tai virtaus tuntuu heikolta</li>
            <li>Yli 10 vuotta edellisestä puhdistuksesta</li>
          </ul>
        </>
      ),
    },
    {
      otsikko: "Painovoimainen ilmanvaihto — eri tilanne",
      sisalto: (
        <p>
          Vanhemmissa taloissa ilmanvaihto toimii ilman konetta, lämpötilaeron ja tuulen avulla. Tällöin
          suodattimia ei ole, mutta hormien kunto ja korvausilman riittävyys on syytä tarkastuttaa noin
          15–20 vuoden välein. Tukkeutunut painovoimainen ilmanvaihto on yleinen syy sisäilmaongelmiin.
        </p>
      ),
    },
  ],
  faq: [
    {
      q: "Kuinka usein IV-suodattimet vaihdetaan?",
      a: "Kaksi kertaa vuodessa — keväällä ja syksyllä. Pölyisellä alueella useammin. Vaihto kestää 5 minuuttia.",
    },
    {
      q: "Kuinka usein ilmanvaihtokanavat pitää puhdistaa?",
      a: "5–10 vuoden välein. Nykyään kanaviston nuohous ei ole lakisääteinen, mutta puhdistus on voimakkaasti suositeltu sisäilman ja energian kannalta.",
    },
    {
      q: "Mitä IV-kanaviston puhdistus maksaa?",
      a: "Omakotitalossa tyypillisesti 400–900 € sis. ALV. Hinta riippuu kanaviston koosta ja likaisuudesta. Useimmiten samassa käynnissä tarkistetaan LTO-kennon kunto.",
    },
    {
      q: "Voinko vaihtaa IV-suodattimet itse?",
      a: "Kyllä, vaihto on yksinkertainen huoltoluukun avaamisesta. Tärkeintä on asentaa suodatin nuolen osoittamaan suuntaan ja muistaa merkitä vaihtopäivä muistiin.",
    },
  ],
};

export const Route = createFileRoute("/opas/iv-puhdistus")({
  component: () => <OpasLayout o={opas} />,
  head: () => opasHead(opas),
});
