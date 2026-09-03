# Etusivun PTS-ominaisuuskortin tekstin päivitys

## Tavoite
Päivittää `src/routes/index.tsx`-tiedoston PTS-ominaisuuskortin otsikko ja leipäteksti uuteen muotoon, säilyttäen muut kortit ja visuaalisen tyylin ennallaan.

## Muutokset

### `src/routes/index.tsx`
- Etsi `FEATURES`-taulukon kohde, jonka otsikko on `"Tiedät jo tänään mitä talossa tapahtuu 10 vuoden päästä"`.
- Korvaa kentät seuraavasti:
  - `title` → `"Kotiluotsi tuntee talosi tilanteen"`
  - `paragraphs` → yksi alkio:
    `"Kotiluotsi ottaa huomioon juuri sinun talosi tiedot ja muodostaa niiden perusteella yksilöllisen pitkän tähtäimen suunnitelman. Se kertoo, milloin talotekniikkaa ja muita talon osia kannattaa huoltaa, korjata tai uusia. Näin tiedät ajoissa, mitä omassa talossasi on tulossa – ja voit välttää turhat kulut ja yllätykset."`
- Älä koske muihin kortteihin, mock-dataan, tyyleihin tai toiminnallisuuteen.

## Tarkistus
- `bun run build` läpi.
- `tsgo` ilman virheitä.
- Esikatselussa varmistetaan, että PTS-kortin uusi teksti näkyy ja muut kortit ovat ennallaan.
