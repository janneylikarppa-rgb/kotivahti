# Etusivun tekstejä edeltävien symbolien ja emojien poisto

## Tavoite

Poistaa kaikki etusivun (`src/routes/index.tsx`) tekstejä edeltävät emojit ja symboliset merkit, jotta ilme pysyy siistinä ja yhtenäisenä.

## Muutokset

### 1. Hero-badge
- Poistetaan `.hero-badge::before`-pseudoelementin `✦`-symboli.

### 2. Ominaisuuskortit (`FEATURES`-array)
- Poistetaan korttien `icon`-kentän emojit: `📋`, `📅`, `🤝`, `📊`, `💰`, `🔧`, `🧮`, `📄`.
- Korttien otsikot ja kuvaukset säilyvät ennallaan.
- Mahdollisesti korvataan ikonit tyhjällä tilalla tai poistetaan `feat-icon`-elementti kokonaan, jos se jäisi tyhjäksi.

### 3. Showcase-osio (`SHOWCASE`-array)
- Poistetaan osioiden `icon`-kentän emojit: `📋`, `📅`, `🤝`, `📊`, `💰`, `🔧`, `📄`.
- Kotitalousvähennys-osiossa säilytetään Lucide-`Calculator`-ikoni (se ei ole emoji/symboli tekstin edessä vaan komponentti).
- Poistetaan `sc-icon`-elementti tai piilotetaan se, jos ikoni jää tyhjäksi.

### 4. Hero-visualin mock-kortti
- Poistetaan tehtävälistan `✓`-merkit (`check-done`) ja korvataan visuaalinen tila joko tyhjällä pallolla tai pelkällä tekstillä.
- Poistetaan PTS-laatikon `⚠`-symboli tekstin edestä.

### 5. Features-strip
- Poistetaan `strip-dot`-elementin `✦`-symbolit.

### 6. Kilpailutus-kategoriat (`CATS`-array)
- Poistetaan kategorioiden edestä emojit: `🏠`, `🔧`, `⚡`, `🌬️`, `🔥`, `🌿`.

### 7. Tarjouslistan tähdet (`OFFERS`-array)
- Poistetaan tähtiarvostelut (`★★★★★`, `★★★★☆`) tai korvataan ne tekstillä.

### 8. CTA-osio
- Poistetaan `.cta-check::before`-pseudoelementin `✓`-merkki.

## Tekniset yksityiskohdat

- Kaikki muutokset vain tiedostossa `src/routes/index.tsx`.
- Ei muutoksia toiminnallisuuteen, reitteihin, backendiin tai muihin sivuihin.
- Säilytetään olemassa olevat CSS-animoinnit ja asettelut; tarvittaessa säädetään ikonien/pisteiden tyylejä, jotta tyhjät tilat eivät riko layoutia.

## Varmistus

- `bun run build` onnistuu.
- `tsgo` ei paljasta TypeScript-virheitä.
- Etusivulla ei näy enää emojeja tai symboleja tekstien edessä.
- Ei console.error-viestejä selaimessa.
