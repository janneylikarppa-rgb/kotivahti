import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal-layout";

export const Route = createFileRoute("/kayttoehdot")({
  head: () => ({
    meta: [
      { title: "Käyttöehdot – Kotiluotsi" },
      { name: "description", content: "Kotiluotsi-palvelun käyttöehdot." },
    ],
  }),
  component: KayttoehdotPage,
});

function KayttoehdotPage() {
  return (
    <LegalLayout title="Käyttöehdot" updated="Toukokuu 2026">
      <p>
        Nämä käyttöehdot ("Ehdot") koskevat Kotiluotsi-palvelua ja siihen liittyvää digitaalista
        talokirjaa ("Palvelu"). Palvelun tarjoaa <strong>[Yrityksen nimi]</strong> (
        <strong>[Y-tunnus]</strong>), kotipaikka <strong>[Paikkakunta]</strong>, Suomi.
      </p>
      <p>
        Käyttämällä Palvelua hyväksyt nämä Ehdot. Mikäli et hyväksy Ehtoja, älä käytä Palvelua.
      </p>

      <h2>1. Palvelun kuvaus</h2>
      <p>
        Kotiluotsi on digitaalinen talokirja omakotitalojen omistajille. Palvelu auttaa
        suunnittelemaan, dokumentoimaan ja seuraamaan kiinteistön huoltoa, kuluja ja kuntoa
        (mm. vuosikello, PTS-ehdotukset, huoltohistoria, kulujen seuranta, liidilomake
        ammattilaisten tilaamiseen).
      </p>
      <p>
        Palvelu on apuväline – se ei korvaa lakisääteisiä katsastuksia, kuntotarkastuksia tai
        viranomaisten edellyttämiä tarkastuksia, eikä se anna ammattilaisen lausuntoa
        rakennuksen kunnosta.
      </p>

      <h2>2. Käyttäjätili</h2>
      <ul>
        <li>Palvelun käyttö edellyttää käyttäjätilin luomista ja sähköpostin vahvistamista.</li>
        <li>Käyttäjä vastaa antamiensa tietojen oikeellisuudesta ja tunnustensa salassapidosta.</li>
        <li>Palvelu on tarkoitettu täysi-ikäisten henkilöiden käyttöön.</li>
      </ul>

      <h2>3. Käyttäjän oikeudet ja velvollisuudet</h2>
      <p>Käyttäjä saa rajoitetun, ei-yksinomaisen oikeuden käyttää Palvelua näiden Ehtojen mukaisesti. Käyttäjä sitoutuu olemaan:</p>
      <ul>
        <li>käyttämättä Palvelua lainvastaiseen toimintaan</li>
        <li>häiritsemättä Palvelun toimintaa</li>
        <li>syöttämättä Palveluun toisten henkilöiden tietoja ilman heidän suostumustaan</li>
      </ul>
      <p>
        Käyttäjällä on EU:n yleisen tietosuoja-asetuksen mukainen oikeus tarkastaa, oikaista,
        poistaa ja siirtää itseään koskevat tiedot. Ks. tarkemmin{" "}
        <Link to="/tietosuoja">tietosuojaseloste</Link>.
      </p>

      <h2>4. Palveluntarjoajan vastuu ja sisällön luonne</h2>
      <p>
        Palvelussa esitetyt PTS-ehdotukset, huoltovälit ja vuosikellon tehtävät perustuvat
        yleisiin suosituksiin ja syötettyihin tietoihin. Ne ovat <strong>ohjeellisia</strong>{" "}
        eivätkä korvaa ammattilaisen tekemää arviota. Käyttäjä vastaa itse päätöksistä, joita
        hän tekee Palvelun tietojen perusteella.
      </p>
      <p>
        Palvelu tarjotaan "sellaisena kuin se on". Emme vastaa virheellisistä tiedoista, joita
        käyttäjä on syöttänyt, eikä välillisistä vahingoista lain sallimissa rajoissa.
      </p>

      <h2>5. Liidilomake ja yhteydet palveluntarjoajiin</h2>
      <p>
        Palvelun kautta voi lähettää tarjous- ja palvelupyyntöjä ("liidi") Kotiluotsiin
        liitetyille ammattilaisille (esim. nuohoojat, kattoasentajat, putkimiehet). Kun
        käyttäjä lähettää pyynnön:
      </p>
      <ul>
        <li>
          Hänen syöttämänsä tiedot (yhteystiedot, kiinteistön tiedot, kuvaus tarpeesta)
          välitetään valitulle ulkopuoliselle palveluntarjoajalle.
        </li>
        <li>
          Kotiluotsi toimii ainoastaan välittäjänä – sopimus mahdollisesta työn suorittamisesta
          syntyy käyttäjän ja ammattilaisen välille.
        </li>
        <li>
          Kotiluotsi ei vastaa ammattilaisen suorituksesta, hinnoittelusta tai työn laadusta.
        </li>
      </ul>

      <h2>6. Immateriaalioikeudet</h2>
      <p>
        Kaikki Palveluun liittyvät immateriaalioikeudet kuuluvat Kotiluotsille tai sen
        lisenssinantajille. Käyttäjän syöttämä sisältö pysyy käyttäjän omaisuutena, mutta
        Kotiluotsilla on oikeus käsitellä sitä Palvelun tarjoamiseksi.
      </p>

      <h2>7. Palvelun saatavuus ja päättäminen</h2>
      <p>
        Pyrimme pitämään Palvelun saatavilla mahdollisimman kattavasti, mutta emme takaa
        keskeytyksetöntä tai virheetöntä toimintaa. Käyttäjä voi lopettaa Palvelun käytön ja
        poistaa tilinsä milloin tahansa. Tilin poistamisen jälkeen tiedot poistetaan tai
        anonymisoidaan kohtuullisessa ajassa (n. 30 vrk), pois lukien tiedot, joiden
        säilyttämiseen meillä on lakiin perustuva velvollisuus.
      </p>

      <h2>8. Ehtojen muuttaminen</h2>
      <p>
        Pidätämme oikeuden muuttaa näitä Ehtoja. Ilmoitamme olennaisista muutoksista palvelun
        kautta tai sähköpostitse. Jatkamalla Palvelun käyttöä muutosten jälkeen hyväksyt
        päivitetyt Ehdot.
      </p>

      <h2>9. Sovellettava laki ja riidat</h2>
      <p>
        Näihin Ehtoihin sovelletaan Suomen lakia. Riitatilanteet pyritään ratkaisemaan
        ensisijaisesti neuvotteluin. Kuluttajalla on oikeus saattaa asia kuluttajariitalauta-
        kunnan käsiteltäväksi tai toimivaltaiseen tuomioistuimeen kuluttajansuojalain
        mukaisesti.
      </p>

      <h2>10. Yhteystiedot</h2>
      <p>
        <strong>[Yrityksen nimi]</strong>
        <br />
        [Osoite]
        <br />
        Sähköposti: <strong>[sähköposti]</strong>
      </p>
    </LegalLayout>
  );
}
