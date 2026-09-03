# Tekstimuutokset: kumppaniverkoston tilanne ja vastausaika

## Tavoite
Päivittää sovelluksen tekstejä kertomaan, että ammattilaiskumppaniverkosto on rakenteilla ja että palvelupyyntöjen vastausajat vaihtelevat. Toiminnallisuus ei muutu.

## Muutokset

### 1. Etusivu – Palveluiden kilpailutus -kortti
**Tiedosto:** `src/routes/index.tsx`

- Lisätään `FEATURES`-taulukon "Palveluiden kilpailutus" -kohteen dataan uusi `note`-kenttä:
  `"Kumppaniverkosto rakenteilla – palvelu laajenee alueittain."`
- Renderöidään kortin `feat-desc`-elementin alla ehdollisesti, jos `note` on määritetty.
- Tyyli: pieni, muted-värinen, kursivoitu teksti (`text-xs`, `italic`, harmaa/vaalea väri), joka ei häiritse muuta sisältöä.

### 2. Palvelupyyntölomake – info-palkki
**Tiedosto:** `src/components/liidi-dialog.tsx`

- Lisätään lomakkeen yläosaan, heti otsikon ja kuvaustekstin alle, info-palkki ennen ensimmäistä kenttää.
- Ikoni: `Info` (lucide-react).
- Teksti:
  `"Kumppaniverkostoamme rakennetaan parhaillaan. Palvelupyyntösi vastaanotetaan ja välitetään – vastausaika voi vaihdella kategorian ja paikkakunnan mukaan."`
- Tyyli:
  - Kevyt kulta/amber-tausta.
  - 1 px kulta/reunaväri.
  - `text-sm`.
  - Positiivinen, ei pelotteleva sävy.
  - Näkyy aina lomakkeessa.

### 3. Vastausaikatekstin korvaaminen
**Tiedosto:** `src/components/liidi-dialog.tsx`

- Korvataan onnistumis-toastissa oleva teksti:
  - Vanha: `"Olemme sinuun yhteydessä 1–3 arkipäivän sisällä"`
  - Uusi: `"Pyyntösi vastaanotetaan ja välitetään ammattilaiselle. Vastausaika vaihtelee kategorian ja paikkakunnan mukaan."`
- Etsitään koko projektista merkkijonot `"1–3 arkipäivän"` ja `"1-3 päivän"` ja korvataan samalla tekstillä, jos muita esiintymiä löytyy.

## Tarkistukset ennen valmista
- Build onnistuu.
- Ei TypeScript-virheitä.
- Tekstit näkyvät oikein etusivulla ja lomakkeessa.
- Vanhaa "1–3 arkipäivän" -tekstiä ei jää projektiin.
