# Ominaisuusosioiden emojien poisto etusivulta

## Tavoite

Poistaa etusivun (`src/routes/index.tsx`) ominaisuusosioiden tekstejä edeltävät emojit ainoastaan "Talokirja"–"Myyntiraportti" -kohdista. Kaikki muut symbolit ja emojit säilyvät ennallaan.

## Muutokset

### 1. Ominaisuuskortit (`FEATURES`-array)
- Poistetaan korttien `icon`-kentän emojit: `📋`, `📅`, `🤝`, `📊`, `💰`, `🔧`, `🧮`, `📄`.
- Muutetaan `icon`-kentän tyyppi sallimaan `null`/`undefined`.
- Päivitetään renderöinti niin, että tyhjä `.feat-icon`-elementti ei jää näkyviin eikä riko layoutia.

### 2. Feature showcase (`SHOWCASE`-array)
- Poistetaan samojen ominaisuuksien `icon`-kentän emojit: `📋`, `📅`, `🤝`, `📊`, `💰`, `🔧`, `📄`.
- Säilytetään Kotitalousvähennys-kohdan Lucide-`Calculator`-ikoni (se ei ole emoji).
- Päivitetään renderöinti niin, että tyhjä `.sc-icon`-elementti ei jää näkyviin.

### 3. Muut osiot säilyvät ennallaan
- Hero-badgen `✦`-symboli säilyy.
- Mock-kortin `✓`-merkit ja `⚠`-symboli säilyvät.
- Features-stripin `✦`-pisteet säilyvät.
- Kilpailutus-kategorioiden emojit (`🏠`, `🔧`, `⚡`, `🌬️`, `🔥`, `🌿`) säilyvät.
- Tarjouslistan tähtiarvostelut (`★★★★★`, `★★★★☆`) säilyvät.
- CTA-osiossa `.cta-check::before`-pseudoelementin `✓`-merkki säilyy.

## Tekniset yksityiskohdat

- Kaikki muutokset vain tiedostossa `src/routes/index.tsx`.
- Ei muutoksia toiminnallisuuteen, reitteihin, backendiin tai muihin sivuihin.
- Säilytetään olemassa olevat CSS-animoinnit ja asettelut; tarvittaessa säädetään ikonielementtien tyylejä, jotta tyhjät tilat eivät riko layoutia.

## Varmistus

- `bun run build` onnistuu.
- `tsgo` ei paljasta TypeScript-virheitä.
- Etusivun "Ominaisuudet"- ja "Showcase"-osioissa ei näy enää emojeja, mutta muut symbolit säilyvät.
- Ei console.error-viestejä selaimessa.
