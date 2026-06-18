import { createFileRoute } from "@tanstack/react-router";
import { OpasLayout, opasHead, type OpasSisalto } from "@/components/opas-layout";

const opas: OpasSisalto = {
  slug: "nuohous-hinta",
  title: "Nuohouksen hinta ja oikea ajankohta",
  description: "Mitä nuohous maksaa, kuinka usein se on tehtävä ja milloin kannattaa varata aika. Käytännön opas omakotitaloasujalle.",
  julkaistu: "2026-06-18",
  intro: (
    <p>
      Nuohous on lakisääteinen vähintään kerran vuodessa vakituisesti asutuissa pientaloissa.
      Tämä opas kertoo mitä se maksaa, milloin se kannattaa tilata ja mitä voit itse tarkastaa.
    </p>
  ),
  osiot: [
    {
      otsikko: "Mitä nuohous maksaa?",
      sisalto: (
        <>
          <p>
            Tyypillinen hinta omakotitalon vuosinuohouksesta on 80–150 € (sis. ALV) yhdestä hormista.
            Hinta vaihtelee paikkakunnan, hormien määrän ja tulisijatyypin mukaan. Lisätyöt — kuten nuohousluukun
            uusiminen tai laajempi hormikuvaus — laskutetaan erikseen.
          </p>
          <p>
            Nuohousala on vapautunut alueellisesta sääntelystä, joten kilpailutus kannattaa: muutaman tarjouksen
            vertailulla erotat tyypillisen tason poikkeuksellisen kalliista.
          </p>
        </>
      ),
    },
    {
      otsikko: "Kuinka usein nuohous on tehtävä?",
      sisalto: (
        <>
          <p>
            Vakituisessa asunnossa puuta polttava tulisija ja hormi on nuohottava <strong>vähintään kerran vuodessa</strong>.
            Vapaa-ajan asunnoilla väli on kolme vuotta. Velvollisuus koskee taloyhtiön omistajaa tai asukasta —
            valvonta on pelastuslaitoksilla.
          </p>
        </>
      ),
    },
    {
      otsikko: "Milloin nuohous kannattaa tilata?",
      sisalto: (
        <>
          <p>
            <strong>Paras ajankohta on kevät</strong> (helmi–huhtikuu): lämmityskausi on käytössä, joten noki ei
            ole ehtinyt pinttyä ja hormi vetää hyvin — työ on tehokkaampaa ja perusteellisempaa. Lisäksi
            nuohoojilla on keväällä paremmin aikaa, joten oman aikataulun mukaisen ajan saa helpommin.
          </p>
          <p>
            Syksy on perinteisesti kiireisin sesonki. Jos varaat ajan loka–marraskuussa, varaudu jonotukseen ja
            siihen että parhaat aikaikkunat ovat jo menneet.
          </p>
        </>
      ),
    },
    {
      otsikko: "Mitä voit tarkastaa itse",
      sisalto: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>Onko nuohousluukussa tai hormin ympärillä näkyviä halkeamia?</li>
            <li>Vetääkö tulisija normaalisti vai tulvahteleeko savua sisään?</li>
            <li>Onko nokimäärä kasvanut edellisestä vuodesta?</li>
          </ul>
          <p>
            Itse nuohousta ei kuitenkaan saa tehdä — laki edellyttää, että työn suorittaa nuohoojan
            ammattitutkinnon suorittanut henkilö.
          </p>
        </>
      ),
    },
  ],
  faq: [
    {
      q: "Kuinka paljon nuohous maksaa Suomessa 2026?",
      a: "Tyypillinen hinta on 80–150 € sisältäen arvonlisäveron, yhdestä hormista. Useammasta hormista hinta nousee porrastetusti. Lisätyöt veloitetaan erikseen.",
    },
    {
      q: "Kuinka usein nuohous on tehtävä?",
      a: "Vakituisessa asunnossa vähintään kerran vuodessa, vapaa-ajan asunnossa joka kolmas vuosi. Velvollisuus koskee kaikkia puuta polttavia tulisijoja ja hormeja.",
    },
    {
      q: "Onko nuohous pakollista?",
      a: "Kyllä, pelastuslaki velvoittaa nuohouksen vakituisesti asutuissa pientaloissa kerran vuodessa. Pelastuslaitos valvoo.",
    },
    {
      q: "Milloin nuohous kannattaa tilata — kevät vai syksy?",
      a: "Kevät on parempi. Lämmityskausi on käytössä joten noki irtoaa paremmin, ja nuohoojilla on saatavuutta. Syksy on perinteisesti kiireisin sesonki.",
    },
    {
      q: "Saako nuohouksen tehdä itse?",
      a: "Ei. Työn saa tehdä vain nuohoojan ammattitutkinnon suorittanut henkilö. Voit kuitenkin itse tarkastaa silmämääräisesti hormin kunnon ja vedon.",
    },
  ],
};

export const Route = createFileRoute("/opas/nuohous-hinta")({
  component: () => <OpasLayout o={opas} />,
  head: () => opasHead(opas),
});
