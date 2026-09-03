# PTS-ominaisuuskortin tekstin päivitys etusivulla

## Tavoite
Päivittää `src/routes/index.tsx`-tiedoston PTS-ominaisuuskortin kuvausteksti uuteen muotoon, säilyttäen otsikon ja muut kortit ennallaan.

## Muutokset

### `src/routes/index.tsx`
- Etsi `FEATURES`-taulukon kohde, jonka otsikko on `"PTS-suunnitelma"` (rivi 249).
- Korvaa kenttä `desc` seuraavalla tekstillä:
  `"Hyvin hoidettu talo on järkevämpi omistaa ja sen arvo säilyy paremmin. PTS auttaa pitämään kodin kunnossa suunnitelmallisesti ja ennakoimaan tulevia tarpeita ennen kuin niistä syntyy ongelmia tai turhia kustannuksia."`
- Älä koske kenttään `title` eikä muihin kortteihin, mock-dataan, tyyleihin tai toiminnallisuuteen.

## Tarkistus
- `bun run build` läpi.
- `tsgo` ilman virheitä.
- Esikatselussa varmistetaan, että PTS-kortin uusi teksti näkyy ja muut kortit ovat ennallaan.
