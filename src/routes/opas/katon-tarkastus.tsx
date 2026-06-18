import { createFileRoute } from "@tanstack/react-router";
import { OpasLayout, opasHead, type OpasSisalto } from "@/components/opas-layout";

const opas: OpasSisalto = {
  slug: "katon-tarkastus",
  title: "Katon tarkastus — mitä, miten ja milloin",
  description: "Säännöllinen katon tarkastus säästää tuhansia. Tästä oppaasta opit mitä ammattilainen tarkistaa ja kuinka usein tarkastus kannattaa tilata.",
  julkaistu: "2026-06-18",
  intro: (
    <p>
      Katto on yksi talon kalleimmista rakenneosista, ja yläpohjan kosteusvaurio on yksi kalleimmista korjauksista.
      Säännöllinen tarkastus paljastaa pienet viat ennen kuin niistä tulee suuria.
    </p>
  ),
  osiot: [
    {
      otsikko: "Kuinka usein katto kannattaa tarkastaa?",
      sisalto: (
        <>
          <p>
            Kattomateriaalista riippumatta suositus on <strong>silmämääräinen tarkastus joka kevät</strong>
            talven jälkeen ja syksyllä ennen sateita. Ammattilaisen perusteellisempi tarkastus tehdään
            tyypillisesti 3–5 vuoden välein.
          </p>
          <p>
            Peltikatto kestää oikein huollettuna 40 vuotta, tiilikatto 50+ vuotta ja bitumihuopa noin 20 vuotta.
            Iän loppupäässä tarkastusväliä lyhennetään.
          </p>
        </>
      ),
    },
    {
      otsikko: "Mitä ammattilainen tarkistaa",
      sisalto: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>Pellit, tiilet ja huopa — irronneet, halkeilleet tai ruostuneet kohdat</li>
            <li>Läpiviennit (savupiippu, IV-piipput, antennit) ja niiden tiivistykset</li>
            <li>Räystäskourut ja syöksyt — kiinnitykset, kallistus, tukkeumat</li>
            <li>Aluskate yläpohjasta käsin — vuotojäljet, irtoamiset</li>
            <li>Sammal-, jäkälä- ja kasvuston määrä</li>
            <li>Kattoturvatuotteet — talikoukut, lapetikkaat, kattosillat</li>
          </ul>
          <p>
            Tarkastuksen tuloksena saat kirjallisen raportin ja toimenpide-ehdotukset hintoineen — voit verrata
            tarjouksia tai tehdä työn omaan tahtiisi.
          </p>
        </>
      ),
    },
    {
      otsikko: "Mitä tarkastus maksaa?",
      sisalto: (
        <p>
          Omakotitalon katon ammattilaistarkastus maksaa tyypillisesti 150–400 € sis. ALV. Hinta riippuu
          rakennuksen koosta, katon jyrkkyydestä ja siitä, sisältyykö raportti. Drone-kuvaus voi nostaa hintaa,
          mutta vähentää kattoturvallisuusriskiä.
        </p>
      ),
    },
    {
      otsikko: "Mitä voit tarkastaa itse",
      sisalto: (
        <>
          <p>
            Kiipeämättä katolle voit kiikareilla tai jopa puhelimen zoomilla:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tarkistaa sammaloituminen ja näkyvät irrotukset</li>
            <li>Tarkkailla räystäiltä jääpuikkojen kertymistä talvella (merkki yläpohjan eristevuodosta)</li>
            <li>Tarkastaa yläpohja sisäpuolelta — kosteusjäljet, valuvedet, hajut</li>
          </ul>
          <p className="text-cream/60">
            Jyrkkä tai liukas katto on aina ammattilaisen työ — putoamissuojaus vaaditaan jo 2 metrin
            putoamiskorkeudelta.
          </p>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "Kuinka usein katto pitää tarkastaa?",
      a: "Silmämääräinen tarkastus joka kevät ja syksy. Ammattilaisen perusteellinen tarkastus 3–5 vuoden välein. Iän loppupäässä useammin.",
    },
    {
      q: "Mitä katon ammattilaistarkastus maksaa?",
      a: "Tyypillisesti 150–400 € sis. ALV omakotitalossa. Hinta riippuu rakennuksen koosta ja siitä, sisältyykö kirjallinen raportti.",
    },
    {
      q: "Kuinka kauan peltikatto kestää?",
      a: "Oikein huollettuna noin 40 vuotta. Maalauskäsittely uusitaan 10–15 vuoden välein. Tiilikatto kestää 50+ vuotta, bitumihuopa noin 20 vuotta.",
    },
    {
      q: "Voinko itse tarkastaa katon?",
      a: "Voit tarkastaa kiikareilla ja yläpohjasta sisäpuolelta. Itse katolle nouseminen on putoamissuojaustyötä — jyrkkä tai liukas katto on aina ammattilaisen työ.",
    },
  ],
};

export const Route = createFileRoute("/opas/katon-tarkastus")({
  component: () => <OpasLayout o={opas} />,
  head: () => opasHead(opas),
});
