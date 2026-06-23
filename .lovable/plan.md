## Tavoite

Yhtenäistää kirjautumisen jälkeiset sivut etusivun "Metsäinen ammattilainen" -ilmeeseen: tumma metsänvihreä pohja + kultainen aksentti + kerma-sävyiset kelluvat kortit, Playfair Display italic -otsikot ja Outfit-leipäteksti. Ei muutoksia logiikkaan, dataan tai reitteihin.

## Vaiheet

**1. Design-tokenit (`src/styles.css`)**
- Lisätään uudet semanttiset sävyt `@theme inline`-lohkoon, jotta ne ovat käytettävissä `bg-*` / `text-*` / `border-*`-luokkina:
  - `--app-bg` = tumma metsänvihreä (vastaa etusivun `--vihrea-dark` #152a22)
  - `--app-bg-2` = sävy tummempi panel-rivit varten
  - `--panel` = kerma-sävyinen kortin tausta (vastaa `--kerma` #f5f0e8)
  - `--gold-line` = `oklch(var(--gold) / 0.20)` kultainen häivähdys-reuna
- Varmistetaan että `--primary` pysyy kullan sävyisenä (on jo); ei uusia hex-arvoja komponenteissa.
- Lisätään `@keyframes fade-up` + `@utility animate-fade-up` (0.6s ease both, viiveet `.delay-100/200/300` utilityina).

**2. Fontit (`src/routes/__root.tsx`)**
- Tarkistetaan että `<link>` lataa Playfair Display + Outfit (etusivulle on aiemmin asetettu DM Sans/Playfair; varmistetaan Outfit mukaan).
- Ei muutoksia `src/styles.css`:n `@import`-riveihin (Tailwind v4: fontit ladataan vain `<link>`illä).

**3. Sidebar (`src/components/app-sidebar.tsx`)**
- Sidebar saa tumman taustan (`bg-[--app-bg]`), kultaisen Kotivahti-logon (Playfair italic, span = kulta).
- Inaktiiviset linkit: `text-muted-foreground/70`, hover `text-cream`.
- Aktiivinen linkki: kullan värinen vasen `border-l-2` + `text-cream`.
- "Kirjaudu ulos" -nappi: muted alareunaan, ei korostusta.
- Mobiilissa Sheet sulkeutuu navigoinnin jälkeen (säilytetään olemassa oleva toiminta).

**4. Kirjautuneen alueen kehys (`src/routes/_authenticated.tsx`)**
- Pääsisältöalueen tausta vaihdetaan `bg-[--app-bg]`:ksi.
- Sisältö renderöityy kortteina kelluen tumman päällä.

**5. Sivujen sisältö (kaikki `src/routes/_authenticated/*.tsx`)**
- Jokaisen sivun yläosaan yhtenäinen otsikkoblokki:

```text
[EYEBROW: uppercase, gold, letter-spacing 0.14em]   Sivun nimi
[H1: Playfair italic, cream]                        Otsikko aksentti
[Sub: Outfit, muted]                                Yhden lauseen alaotsikko
```

- Sivukohtaiset eyebrowt: Dashboard → "Talosi tilanne", Talon tiedot, PTS → "Pitkän tähtäimen suunnitelma", Vuosikello, Huoltohistoria, Kulut → "Kulujenseuranta", Pyynnöt → "Tilatut palvelut", Admin → "Liidien hallinta".
- Otsikkoblokille `animate-fade-up`, korttirivin ensiesiintymälle viive 0.1–0.3 s.
- Listoja/taulukoita ei animoida.

**6. Kortit ja komponentit (`src/components/*`)**
- Yhtenäistetään: `rounded-xl`, `shadow-2xl`, `bg-[--panel]`, `border border-[--gold-line]`.
- Päivitetään: `huolto-form.tsx`, `kausikirje-toggle.tsx`, `liidi-dialog.tsx`, `property-switcher.tsx`, `legal-layout.tsx`, `opas-layout.tsx` käyttämään samoja korttitokeneita.
- `palaute-kortti.tsx`: vain tausta = `--panel` ja reunus = `--gold-line`. Kysymyksiin, ehtoihin ja `palaute.functions.ts`-kutsuihin ei kosketa.

**7. Napit**
- Päätoiminto: olemassa oleva `Button` (default-variantti, käyttää `--primary` = kulta) — tarkistetaan ettei missään ole `bg-[#...]` -ohituksia.
- Toissijainen: `variant="outline"` saa kultaisen reunan (`border-[--primary] text-[--primary] hover:bg-[--primary]/10`).
- Destruktiiviset säilyvät `--destructive`-tokenissa.

**8. Lopputarkastus**
- Käydään 8 kohdesivua läpi 390 px ja 1280 px viewporteilla; tarkistetaan checklist promptin mukaan (otsikko Playfair italic, tumma tausta, kelluvat kortit, kultainen aktiivilinkki, kullan sävyiset napit, eyebrow uppercase, mobiilissa sidebar sulkeutuu).

## Mitä EI muuteta

- Ei `tailwind.config.js`:ää (Tailwind v4 → config CSS:ssä).
- Ei muutoksia liiketoimintalogiikkaan, server-funktioihin, kyselyihin tai reittipuuhun.
- Ei muutoksia palaute-järjestelmän logiikkaan — vain värit/reunus.
- Ei uusia npm-riippuvuuksia.
- Etusivua (`src/routes/index.tsx`) ei muuteta.

## Tekninen huomio

Etusivun nykyinen `<style>`-lohko käyttää omia muuttujia (`--vihrea-dark`, `--kulta`, `--kerma`). Nämä eivät ole jaettuja tokeneita. Tässä vaiheessa **emme yhdistä etusivun CSS:ää** semanttisiin tokeneihin (se olisi erillinen refaktoroitava työ joka voisi rikkoa etusivun ilmeen). Sen sijaan luomme tokenit, joiden arvot vastaavat visuaalisesti etusivun värejä, ja käytämme niitä vain kirjautuneella alueella. Lopputulos on visuaalisesti yhtenäinen, vaikka koodi on kahdessa paikassa.
