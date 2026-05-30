import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalLayout } from "@/components/legal-layout";

export const Route = createFileRoute("/tietosuoja")({
  head: () => ({
    meta: [
      { title: "Tietosuojaseloste – Kotivahti" },
      { name: "description", content: "Kotivahti-palvelun tietosuojaseloste (GDPR)." },
    ],
  }),
  component: TietosuojaPage,
});

function TietosuojaPage() {
  return (
    <LegalLayout title="Tietosuojaseloste" updated="Toukokuu 2026">
      <p>
        Tässä tietosuojaselosteessa kerromme, miten käsittelemme Kotivahti-palvelun käyttäjien
        henkilötietoja EU:n yleisen tietosuoja-asetuksen (GDPR) mukaisesti.
      </p>

      <h2>1. Rekisterinpitäjä</h2>
      <p>
        <strong>[Yrityksen nimi]</strong>
        <br />
        Y-tunnus: <strong>[Y-tunnus]</strong>
        <br />
        Osoite: [Osoite]
        <br />
        Sähköposti: <strong>[sähköposti]</strong>
      </p>

      <h2>2. Yhteyshenkilö tietosuoja-asioissa</h2>
      <p>
        Nimi: <strong>[Nimi]</strong>
        <br />
        Sähköposti: <strong>[sähköposti]</strong>
      </p>

      <h2>3. Käsiteltävät henkilötiedot</h2>
      <ul>
        <li>
          <strong>Tilitiedot:</strong> nimi, sähköposti, salasanan tiiviste, kirjautumisaika
        </li>
        <li>
          <strong>Profiilitiedot:</strong> puhelinnumero (vapaaehtoinen), suostumusten
          aikaleimat
        </li>
        <li>
          <strong>Kiinteistötiedot:</strong> osoite, rakennusvuosi, pinta-alat, materiaalit,
          tekniset järjestelmät, huoltohistoria, dokumentit
        </li>
        <li>
          <strong>Käyttötiedot:</strong> palvelun käyttöön liittyvät lokitiedot ja IP-osoite
        </li>
        <li>
          <strong>Liidilomakkeen tiedot:</strong> yhteystiedot ja tarpeen kuvaus, jotka
          käyttäjä lähettää ammattilaiselle
        </li>
      </ul>

      <h2>4. Käsittelyn tarkoitukset ja oikeusperusteet</h2>
      <ul>
        <li>Palvelun tarjoaminen ja käyttäjätilin hallinta (sopimus)</li>
        <li>Liidipyyntöjen välittäminen ammattilaisille (sopimus / suostumus)</li>
        <li>Palvelun kehittäminen ja tilastointi (oikeutettu etu)</li>
        <li>Lakisääteisten velvollisuuksien täyttäminen (lakisääteinen velvoite)</li>
      </ul>

      <h2>5. Tietojen vastaanottajat ja luovutukset</h2>
      <ul>
        <li>
          <strong>Lähetetyt liidit:</strong> Tiedot välitetään valitulle ulkopuoliselle
          palveluntarjoajalle (esim. nuohooja). Palveluntarjoaja toimii itsenäisenä
          rekisterinpitäjänä omien tietojensa osalta.
        </li>
        <li>
          <strong>Tekniset palveluntarjoajat:</strong> Käytämme alustana Lovable Cloudia, joka
          käyttää Supabasen ja AWS:n / Cloudflaren infrastruktuuria EU:ssa.
        </li>
        <li>Tietoja ei myydä eikä luovuteta markkinointitarkoituksiin.</li>
      </ul>

      <h2>6. Tietojen siirto EU/ETA:n ulkopuolelle</h2>
      <p>
        Pyrimme pitämään tiedot EU/ETA-alueella. Mikäli tietoja siirretään ulkopuolelle,
        teemme sen tietosuoja-asetuksen mukaisin suojatoimin (esim. EU:n mallisopimuslausekkeet).
      </p>

      <h2>7. Säilytysaika</h2>
      <ul>
        <li>Tilitiedot ja kiinteistötiedot: niin kauan kuin tili on aktiivinen</li>
        <li>Liidipyynnöt: 24 kk lähetyksestä</li>
        <li>Lokitiedot: enintään 12 kk</li>
        <li>Tilin poiston jälkeen tiedot anonymisoidaan tai poistetaan n. 30 vrk kuluessa</li>
      </ul>

      <h2>8. Rekisteröidyn oikeudet</h2>
      <p>Sinulla on oikeus:</p>
      <ul>
        <li>tarkastaa itseäsi koskevat tiedot</li>
        <li>vaatia virheellisten tietojen oikaisemista</li>
        <li>vaatia tietojen poistamista ("oikeus tulla unohdetuksi")</li>
        <li>rajoittaa tai vastustaa käsittelyä</li>
        <li>siirtää tietosi järjestelmästä toiseen (tiedon siirrettävyys)</li>
        <li>peruuttaa suostumus milloin tahansa</li>
        <li>tehdä valitus valvontaviranomaiselle</li>
      </ul>

      <h2>9. Tietoturva</h2>
      <p>
        Suojaamme tiedot asianmukaisin teknisin ja organisatorisin toimenpitein (mm. salattu
        tietoliikenne, pääsynhallinta, tietokannan käyttöoikeudet rajattu rooleilla, säännölliset
        varmuuskopiot).
      </p>

      <h2>10. Evästeet</h2>
      <p>
        Käytämme palvelun toiminnan kannalta välttämättömiä evästeitä (mm. kirjautumistila).
        Emme käytä mainosseurantaa.
      </p>

      <h2>11. Yhteydenotot ja valitus valvontaviranomaiselle</h2>
      <p>
        Tietosuojaan liittyvissä kysymyksissä voit olla yhteydessä yhteyshenkilöömme (kohta 2).
      </p>
      <p>
        Sinulla on oikeus tehdä valitus tietosuojavaltuutetun toimistolle:
        <br />
        Tietosuojavaltuutetun toimisto, Lintulahdenkuja 4, 00530 Helsinki
        <br />
        Postiosoite: PL 800, 00531 Helsinki
        <br />
        Sähköposti: tietosuoja(at)om.fi · Puh. 029 56 66700
        <br />
        Verkkosivusto: <a href="https://tietosuoja.fi" target="_blank" rel="noreferrer">www.tietosuoja.fi</a>
      </p>

      <h2>12. Tietosuojaselosteen muuttaminen</h2>
      <p>
        Kehitämme palvelua jatkuvasti ja pidätämme oikeuden muuttaa tätä tietosuojaselostetta.
        Ilmoitamme olennaisista muutoksista palvelumme kautta tai sähköpostitse. Ks. myös{" "}
        <Link to="/kayttoehdot">käyttöehdot</Link>.
      </p>
    </LegalLayout>
  );
}
