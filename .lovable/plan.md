# Admin-datan suojaus: tilanne ja ainoa puuttuva pala

Tarkistin tietokannan nykytilan. Pyydetyt RLS-suojaukset ovat **jo voimassa** — eikä niitä pidä ajaa ehdotetussa muodossa, koska ehdotus nojaa `profiles.role`-sarakkeeseen, jota ei ole (roolit ovat erillisessä roolitaulussa, mikä on turvallisempi ratkaisu).

## Nykytila (varmennettu kannasta)

Kaikissa neljässä taulussa rivitason suojaus on päällä ja säännöt käyttävät turvallista rooli­tarkistusta:

- **liidit** — käyttäjä näkee omat, ylläpitäjä kaikki; muokkaus ja poisto vain ylläpitäjälle.
- **ammattilaiset** — luku, lisäys, muokkaus ja poisto vain ylläpitäjälle.
- **kayttaja_metriikat** — käyttäjä näkee omat, ylläpitäjä kaikki.
- **palaute_kyselyt** — käyttäjä näkee omat, ylläpitäjä kaikki.

Eli TASO 3 on kunnossa, ja TASO 1 (Admin-linkin piilotus) tehtiin edellisessä vaiheessa.

## Mitä vielä tehdään: TASO 2 (reittisuojaus)

Tällä hetkellä `/admin` avautuu suoralla osoitteella myös tavalliselle käyttäjälle, mutta näyttää vain "Ei käyttöoikeuksia" -kortin (dataa ei palaudu). Muutetaan tämä ohjaukseksi:

`src/routes/_authenticated/admin.tsx`
- Kun rooli­tarkistus on valmistunut eikä käyttäjä ole ylläpitäjä, ohjataan käyttäjä `/dashboard`-sivulle "Ei käyttöoikeuksia" -ilmoituksella tekstikortin sijaan.
- Latauksen aikana näytetään edelleen nykyinen "Tarkistetaan oikeuksia..." -tila, jottei näkymä välähdä.

Ei tietokantamuutoksia, ei muutoksia muuhun navigaatioon.
